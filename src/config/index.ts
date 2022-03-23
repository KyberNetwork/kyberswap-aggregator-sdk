import { ChainId } from '@dynamic-amm/sdk'
import { ethers } from 'ethers'

const REACT_APP_INFURA_KEY="9aa3d95b3bc440fa88ea12eaa4456161"
const REACT_APP_AGGREGATOR_API="https://aggregator-api.kyberswap.com"

export const NETWORK_URLS: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: 'https://ethereum.kyber.network/v1/mainnet/geth?appId=prod-dmm-interface',
  [ChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${REACT_APP_INFURA_KEY}`,
  [ChainId.ROPSTEN]: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  [ChainId.GÖRLI]: `https://goerli.infura.io/v3/${REACT_APP_INFURA_KEY}`,
  [ChainId.KOVAN]: `https://kovan.infura.io/v3/${REACT_APP_INFURA_KEY}`,
  [ChainId.MUMBAI]: `https://rpc-mumbai.maticvigil.com`,
  [ChainId.MATIC]: `https://polygon.dmm.exchange/v1/mainnet/geth?appId=prod-dmm`,
  [ChainId.BSCTESTNET]: `https://data-seed-prebsc-1-s1.binance.org:8545`,
  [ChainId.BSCMAINNET]: `https://bsc.dmm.exchange/v1/mainnet/geth?appId=prod-dmm-interface`,
  [ChainId.AVAXTESTNET]: `https://api.avax-test.network/ext/bc/C/rpc`,
  [ChainId.AVAXMAINNET]: `https://avalanche.dmm.exchange/v1/mainnet/geth?appId=prod-dmm`,
  [ChainId.FANTOM]: `https://rpc.ftm.tools`,
  [ChainId.CRONOSTESTNET]: `https://cronos-testnet-3.crypto.org:8545`,
  [ChainId.CRONOS]: `https://evm-cronos.crypto.org`,
  // [ChainId.BTTC]: `https://rpc.bt.io`,
  [ChainId.BTTC]: `https://bttc.dev.kyberengineering.io`,
  [ChainId.ARBITRUM]: `https://arb1.arbitrum.io/rpc`,
  [ChainId.ARBITRUM_TESTNET]: `https://rinkeby.arbitrum.io/rpc`,
  [ChainId.VELAS]: 'https://evmexplorer.velas.com/rpc',
  [ChainId.AURORA]: `https://mainnet.aurora.dev/GvfzNcGULXzWqaVahC8WPTdqEuSmwNCu3Nu3rtcVv9MD`,
  [ChainId.OASIS]: `https://emerald.oasis.dev`,
}

export const providers: {
  [chainId in ChainId]?: any
} = {
  [ChainId.MAINNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.MAINNET]),
  [ChainId.BSCMAINNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.BSCMAINNET]),
  [ChainId.AVAXMAINNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.AVAXMAINNET]),
  [ChainId.MATIC]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.MATIC]),
  [ChainId.FANTOM]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.FANTOM]),
  [ChainId.CRONOS]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.CRONOS]),
  [ChainId.AURORA]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.AURORA]),
  [ChainId.ROPSTEN]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.ROPSTEN]),
  [ChainId.MUMBAI]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.MUMBAI]),
  [ChainId.AVAXTESTNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.AVAXTESTNET]),
  [ChainId.BSCTESTNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.BSCTESTNET]),
  [ChainId.CRONOSTESTNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.CRONOSTESTNET]),
  [ChainId.ARBITRUM_TESTNET]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.ARBITRUM_TESTNET]),
  [ChainId.ARBITRUM]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.ARBITRUM]),
  [ChainId.BTTC]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.BTTC]),
  [ChainId.VELAS]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.VELAS]),
  [ChainId.OASIS]: new ethers.providers.JsonRpcProvider(NETWORK_URLS[ChainId.OASIS]),
}

//https://router.firebird.finance/bsc/route
export const routerUri: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: `${REACT_APP_AGGREGATOR_API}/ethereum/route`,
  [ChainId.BSCMAINNET]: `${REACT_APP_AGGREGATOR_API}/bsc/route`,
  [ChainId.MATIC]: `${REACT_APP_AGGREGATOR_API}/polygon/route`,
  [ChainId.AVAXMAINNET]: `${REACT_APP_AGGREGATOR_API}/avalanche/route`,
  [ChainId.FANTOM]: `${REACT_APP_AGGREGATOR_API}/fantom/route`,
  [ChainId.CRONOS]: `${REACT_APP_AGGREGATOR_API}/cronos/route`,
  [ChainId.ARBITRUM]: `${REACT_APP_AGGREGATOR_API}/arbitrum/route`,
  [ChainId.BTTC]: `${REACT_APP_AGGREGATOR_API}/bttc/route`,
  [ChainId.AURORA]: `${REACT_APP_AGGREGATOR_API}/aurora/route`,
  [ChainId.VELAS]: `${REACT_APP_AGGREGATOR_API}/velas/route`,
  [ChainId.OASIS]: `${REACT_APP_AGGREGATOR_API}/oasis/route`,
}

export const AGGREGATION_EXECUTOR: { [chainId in ChainId]?: string } = {
  [ChainId.BSCMAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.MATIC]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.AVAXMAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.MAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.FANTOM]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.CRONOS]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.BTTC]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.ARBITRUM]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.AURORA]: '0xd12bcdFB9A39BE79DA3bDF02557EFdcD5CA59e77',
  [ChainId.VELAS]: '0xd12bcdFB9A39BE79DA3bDF02557EFdcD5CA59e77',
  [ChainId.OASIS]: '0xd12bcdFB9A39BE79DA3bDF02557EFdcD5CA59e77',
}

export const ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const ZERO_HEX = '0x0'
