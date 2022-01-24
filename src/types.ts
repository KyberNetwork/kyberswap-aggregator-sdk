export interface FeeConfig {
  chargeFeeBy: 'currency_in' | 'currency_out'
  feeReceiver: string
  isInBps: boolean
  feeAmount: string // Unit: bps or currency amount
}

/**
 * The parameters to use in the call to the DmmExchange Router to execute a trade.
 */
export interface SwapV2Parameters {
  methodNames: string[]
  args: Array<string | Array<string | string[]>>
  value: string
}

export interface TradeConfig {
  minAmountOut: string
  recipient: string
  deadline: number
}

export interface GetSwapParametersParams {
  chainId: number
  currencyInAddress: string
  currencyInDecimals: number
  amountIn: string
  currencyOutAddress: string
  currencyOutDecimals: number
  tradeConfig: TradeConfig
  feeConfig: FeeConfig | undefined
}

export interface GetSwapParametersCustomTradeRouteParams extends GetSwapParametersParams {
  customTradeRoute: string | undefined
}
