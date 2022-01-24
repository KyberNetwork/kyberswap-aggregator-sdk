import invariant from 'tiny-invariant'
import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER,
  Token,
  TokenAmount,
  TradeType,
  validateAndParseAddress,
} from '@dynamic-amm/sdk'
import {
  Aggregator,
  encodeFeeConfig,
  encodeSimpleModeData,
  encodeSwapExecutor,
  isEncodeUniswapCallback,
} from './aggregator'
import { ETHER_ADDRESS, providers, routerUri, ZERO_HEX } from './config'
import { GetSwapParametersCustomTradeRouteParams, GetSwapParametersParams, SwapV2Parameters } from './types'

import { getAggregationExecutorAddress, getAggregationExecutorContract, numberToHex, toSwapAddress } from './utils'
import BigNumber from 'bignumber.js'

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export async function getTradeExactInV2(
  currencyAmountIn: CurrencyAmount | undefined,
  currencyOut: Currency | undefined,
  saveGas: boolean | undefined,
  chainId: ChainId | undefined
): Promise<Aggregator | null> {
  // const parsedQs: { dexes?: string } = useParsedQueryString()
  const routerApi = routerUri[chainId ?? ChainId.MAINNET]
  if (!routerApi) {
    return null
  }

  const gasPrice = undefined
  if (currencyAmountIn && currencyOut) {
    const trade = await Aggregator.bestTradeExactIn(
      routerApi,
      currencyAmountIn,
      currencyOut,
      saveGas,
      undefined, // parsedQs.dexes,
      gasPrice
    )
    return trade
  } else {
    return null
  }
}

export default async function getSwapParameters({
  chainId,
  currencyInAddress,
  currencyInDecimals,
  amountIn,
  currencyOutAddress,
  currencyOutDecimals,
  tradeConfig,
  feeConfig,
  customTradeRoute,
}: GetSwapParametersCustomTradeRouteParams): Promise<SwapV2Parameters | undefined> {
  const result = await getData({
    chainId,
    currencyInAddress,
    currencyInDecimals,
    amountIn,
    currencyOutAddress,
    currencyOutDecimals,
    tradeConfig,
    feeConfig,
    customTradeRoute,
  })
  return result.swapV2Parameters
}

function parseInput({
  chainId,
  currencyInAddress,
  currencyInDecimals,
  amountIn,
  currencyOutAddress,
  currencyOutDecimals,
}: GetSwapParametersParams): {
  chainId: ChainId
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
} {
  const currencyAmountIn: CurrencyAmount =
    currencyInAddress === ETHER_ADDRESS
      ? CurrencyAmount.ether(amountIn)
      : new TokenAmount(new Token(chainId, currencyInAddress, currencyInDecimals), amountIn)
  const currencyOut: Currency =
    currencyOutAddress === ETHER_ADDRESS ? Currency.ETHER : new Token(chainId, currencyOutAddress, currencyOutDecimals)

  return {
    chainId: chainId as ChainId,
    currencyAmountIn,
    currencyOut,
  }
}

export async function getData({
  chainId: _chainId,
  currencyInAddress,
  currencyInDecimals,
  amountIn: _amountIn,
  currencyOutAddress,
  currencyOutDecimals,
  tradeConfig,
  feeConfig,
  customTradeRoute,
}: GetSwapParametersCustomTradeRouteParams): Promise<{
  swapV2Parameters: SwapV2Parameters | undefined
  rawExecutorData: unknown
  isUseSwapSimpleMode: boolean | undefined
  tradeRoute: any[][] | undefined
}> {
  const { currencyAmountIn, currencyOut, chainId } = parseInput({
    chainId: _chainId,
    currencyInAddress,
    currencyInDecimals,
    amountIn: _amountIn,
    currencyOutAddress,
    currencyOutDecimals,
    tradeConfig,
    feeConfig,
  })
  const trade = await getTradeExactInV2(currencyAmountIn, currencyOut, false, chainId)
  if (!trade) {
    return {
      swapV2Parameters: undefined,
      rawExecutorData: undefined,
      isUseSwapSimpleMode: undefined,
      tradeRoute: undefined,
    }
  }
  const tradeRoute: any[][] = customTradeRoute ? JSON.parse(customTradeRoute) : trade.swaps
  const etherIn = trade.inputAmount.currency === ETHER
  const etherOut = trade.outputAmount.currency === ETHER
  // the router does not support both ether in and out
  invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')

  const to: string = validateAndParseAddress(tradeConfig.recipient)
  const tokenIn: string = toSwapAddress(trade.inputAmount)
  const tokenOut: string = toSwapAddress(trade.outputAmount)
  const amountIn: string = '0x' + new BigNumber(_amountIn).toString(16)
  const amountInWithFeeIn: string =
    feeConfig && feeConfig.chargeFeeBy === 'currency_in'
      ? feeConfig.isInBps
        ? '0x' +
          new BigNumber(_amountIn)
            .div(new BigNumber(1).minus(new BigNumber(feeConfig.feeAmount).div(10000)))
            .toString(16)
        : '0x' + new BigNumber(amountIn).plus(feeConfig.feeAmount).toString(16)
      : amountIn
  const amountOut: string = '0x' + new BigNumber(tradeConfig.minAmountOut).toString(16)
  const deadline = '0x' + tradeConfig.deadline.toString(16)
  const destTokenFeeData =
    feeConfig && feeConfig.chargeFeeBy === 'currency_out'
      ? encodeFeeConfig({
          feeReceiver: feeConfig.feeReceiver,
          isInBps: feeConfig.isInBps,
          feeAmount: feeConfig.feeAmount,
        })
      : '0x'
  let methodNames: string[] = []
  let args: Array<string | Array<string | string[]>> = []
  let value: string = ZERO_HEX
  let rawExecutorData: unknown = undefined
  let isUseSwapSimpleMode: boolean | undefined

  switch (trade.tradeType) {
    case TradeType.EXACT_INPUT: {
      methodNames = ['swap']
      if (!tokenIn || !tokenOut || !amountIn || !amountOut) {
        break
      }
      const aggregationExecutorAddress = getAggregationExecutorAddress(chainId ?? ChainId.MAINNET)
      if (!aggregationExecutorAddress) {
        break
      }
      const aggregationExecutorContract = getAggregationExecutorContract(
        chainId ?? ChainId.MAINNET,
        providers[chainId ?? ChainId.MAINNET]
      )
      const src: { [p: string]: BigNumber } = {}
      const isEncodeUniswap = isEncodeUniswapCallback(chainId ?? ChainId.MAINNET)
      if (feeConfig && feeConfig.chargeFeeBy === 'currency_in') {
        const { feeReceiver } = feeConfig
        src[feeReceiver] = new BigNumber(amountInWithFeeIn).minus(amountIn)
      }
      // Use swap simple mode when tokenIn is not ETH and every firstPool is encoded by uniswap.
      isUseSwapSimpleMode = !etherIn
      if (isUseSwapSimpleMode) {
        for (let i = 0; i < tradeRoute.length; i++) {
          const sequence = tradeRoute[i]
          const firstPool = sequence[0]
          if (!isEncodeUniswap(firstPool)) {
            isUseSwapSimpleMode = false
            break
          }
        }
      }
      const getSwapSimpleModeArgs = () => {
        const firstPools: string[] = []
        const firstSwapAmounts: string[] = []
        tradeRoute.forEach((sequence) => {
          for (let i = 0; i < sequence.length; i++) {
            if (i === 0) {
              const firstPool = sequence[0]
              firstPools.push(firstPool.pool)
              firstSwapAmounts.push(firstPool.swapAmount)
              if (isEncodeUniswap(firstPool)) {
                firstPool.collectAmount = '0'
              }
              if (sequence.length === 1 && isEncodeUniswap(firstPool)) {
                firstPool.recipient =
                  etherOut || feeConfig?.chargeFeeBy === 'currency_out' ? aggregationExecutorAddress : to
              }
            } else {
              const A = sequence[i - 1]
              const B = sequence[i]
              if (isEncodeUniswap(A) && isEncodeUniswap(B)) {
                A.recipient = B.pool
                B.collectAmount = '0'
              } else if (isEncodeUniswap(B)) {
                B.collectAmount = '1'
              } else if (isEncodeUniswap(A)) {
                A.recipient = aggregationExecutorAddress
              }
              if (i === sequence.length - 1 && isEncodeUniswap(B)) {
                B.recipient = etherOut || feeConfig?.chargeFeeBy === 'currency_out' ? aggregationExecutorAddress : to
              }
            }
          }
        })
        const swapSequences = encodeSwapExecutor(tradeRoute, chainId ?? ChainId.MAINNET)
        const sumSrcAmounts = Object.values(src).reduce((sum, value) => sum.plus(value), new BigNumber('0'))
        const sumFirstSwapAmounts = firstSwapAmounts.reduce((sum, value) => sum.plus(value), new BigNumber('0'))
        const amount = sumSrcAmounts.plus(sumFirstSwapAmounts).toString()
        const swapDesc = [
          tokenIn,
          tokenOut,
          Object.keys(src), // srcReceivers
          Object.values(src).map((amount) => amount.toString()), // srcAmounts
          to,
          amount,
          amountOut,
          numberToHex(32),
          destTokenFeeData,
        ]
        const executorDataForSwapSimpleMode = encodeSimpleModeData({
          firstPools,
          firstSwapAmounts,
          swapSequences,
          deadline,
          destTokenFeeData,
        })
        args = [aggregationExecutorAddress, swapDesc, executorDataForSwapSimpleMode]
        rawExecutorData = {
          firstPools,
          firstSwapAmounts,
          swapSequences,
          deadline,
          destTokenFeeData,
        }
      }
      const getSwapNormalModeArgs = () => {
        tradeRoute.forEach((sequence) => {
          for (let i = 0; i < sequence.length; i++) {
            if (i === 0) {
              const firstPool = sequence[0]
              if (etherIn) {
                if (isEncodeUniswap(firstPool)) {
                  firstPool.collectAmount = firstPool.swapAmount
                }
              } else {
                if (isEncodeUniswap(firstPool)) {
                  firstPool.collectAmount = firstPool.swapAmount
                }
                src[aggregationExecutorAddress] = new BigNumber(firstPool.swapAmount).plus(
                  src[aggregationExecutorAddress] ?? '0'
                )
              }
              if (sequence.length === 1 && isEncodeUniswap(firstPool)) {
                firstPool.recipient =
                  etherOut || feeConfig?.chargeFeeBy === 'currency_out' ? aggregationExecutorAddress : to
              }
            } else {
              const A = sequence[i - 1]
              const B = sequence[i]
              if (isEncodeUniswap(A) && isEncodeUniswap(B)) {
                A.recipient = B.pool
                B.collectAmount = '0'
              } else if (isEncodeUniswap(B)) {
                B.collectAmount = '1'
              } else if (isEncodeUniswap(A)) {
                A.recipient = aggregationExecutorAddress
              }
              if (i === sequence.length - 1 && isEncodeUniswap(B)) {
                B.recipient = etherOut || feeConfig?.chargeFeeBy === 'currency_out' ? aggregationExecutorAddress : to
              }
            }
          }
        })
        const swapSequences = encodeSwapExecutor(tradeRoute, chainId ?? ChainId.MAINNET)
        const swapDesc = [
          tokenIn,
          tokenOut,
          Object.keys(src), // srcReceivers
          Object.values(src).map((amount) => amount.toString()), // srcAmounts
          to,
          feeConfig && feeConfig.chargeFeeBy === 'currency_in'
            ? feeConfig.isInBps
              ? '0x' +
                new BigNumber(_amountIn)
                  .div(new BigNumber(1).minus(new BigNumber(feeConfig.feeAmount).div(10000)))
                  .toString(16)
              : '0x' + new BigNumber(amountIn).plus(feeConfig.feeAmount).toString(16)
            : amountIn,
          amountOut,
          etherIn ? numberToHex(0) : numberToHex(4),
          destTokenFeeData,
        ]
        let executorData = aggregationExecutorContract.interface.encodeFunctionData('nameDoesntMatter', [
          [swapSequences, tokenIn, tokenOut, amountOut, to, deadline, destTokenFeeData],
        ])
        // Remove method id (slice 10).
        executorData = '0x' + executorData.slice(10)
        args = [aggregationExecutorAddress, swapDesc, executorData]
        rawExecutorData = [swapSequences, tokenIn, tokenOut, amountOut, to, deadline, destTokenFeeData]
      }
      if (isUseSwapSimpleMode) {
        getSwapSimpleModeArgs()
      } else {
        getSwapNormalModeArgs()
      }
      if (etherIn) {
        if (feeConfig && feeConfig.chargeFeeBy === 'currency_in') {
          value = amountInWithFeeIn
        } else {
          value = amountIn
        }
      }
      break
    }
  }

  return {
    swapV2Parameters: {
      methodNames,
      args,
      value,
    },
    isUseSwapSimpleMode,
    rawExecutorData,
    tradeRoute,
  }
}

export * from './config/index'
export * from './types'
