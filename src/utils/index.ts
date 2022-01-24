import { ChainId, CurrencyAmount, ETHER, TokenAmount } from '@dynamic-amm/sdk'
import { AGGREGATION_EXECUTOR, ETHER_ADDRESS } from '../config'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'
import AGGREGATOR_EXECUTOR_ABI from '../abis/aggregation-executor.json'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function toSwapAddress(currencyAmount: CurrencyAmount) {
  if (currencyAmount.currency === ETHER) {
    return ETHER_ADDRESS
  }
  return currencyAmount instanceof TokenAmount ? currencyAmount.token.address : ''
}

export function getAggregationExecutorAddress(chainId: ChainId): string {
  return AGGREGATION_EXECUTOR[chainId] || ''
}

export function getContract(address: string, ABI: any, library: Web3Provider): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return new Contract(address, ABI, library)
}

export function getAggregationExecutorContract(chainId: ChainId, library: Web3Provider): Contract {
  return getContract(getAggregationExecutorAddress(chainId), AGGREGATOR_EXECUTOR_ABI, library)
}

export function numberToHex(num: number) {
  return `0x${num.toString(16)}`
}
