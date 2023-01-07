import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../../types/RealTokenYam/ERC20'
import { RealTokenYam } from '../../../types/RealTokenYam/RealTokenYam'
import { Token } from '../../../types/schema'
import { Statistics } from '../statistics/Statistics'

export function getToken (address: Address): Token {
  let token = Token.load(address.toHex())
  if (token == null) {
    Statistics.increaseTokensCount()
    token = new Token(address.toHex())
    token.address = address
    token.type = getTokenType(address)
    token.offers = []
    token.offersCount = BigInt.fromI32(0)
    token.transactions = []
    token.transactionsCount = BigInt.fromI32(0)
    token.historyDaysCount = BigInt.fromI32(0)
    token.historyMonthsCount = BigInt.fromI32(0)
    token.volume = BigInt.fromI32(0)

    if (isNativeToken(address)) {
      // TODO: Find a way to get the name and symbol of the native token
      token.name = 'xDai'
      token.symbol = 'xDai'
      token.decimals = BigInt.fromI32(18)
      token.type = 'NATIVETOKEN'
    } else {
      const tokenContract = ERC20.bind(address)
  
      if (tokenContract) {
        const decimals = tokenContract.try_decimals()
        const name = tokenContract.try_name()
        const symbol = tokenContract.try_symbol()
  
        token.decimals = decimals.reverted ? BigInt.fromI32(18) : BigInt.fromI32(decimals.value)
        token.name = name.reverted ? 'unknown' : name.value
        token.symbol = symbol.reverted ? 'unknown' : symbol.value
      }
    }

    token.save()
  }
  return token
}

function isNativeToken (address: Address): boolean {
  return address.equals(Address.fromString('0x0000000000000000000000000000000000000000'))
}

function getTokenType (address: Address): string {
  const contract = RealTokenYam.bind(dataSource.address())

  if (contract) {
    const tokenType = contract.try_getTokenType(address)
    switch (tokenType.value) {
      case 1:
        return 'REALTOKEN'
      case 2:
        return 'ERC20WITHPERMIT'
      case 3:
        return 'ERC20WITHOUTPERMIT'
    }
  }
  return 'NOTWHITELISTEDTOKEN'
}