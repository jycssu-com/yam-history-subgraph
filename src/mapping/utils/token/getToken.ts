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
    token.offers = []
    token.offersCount = BigInt.fromI32(0)
    token.transactions = []
    token.transactionsCount = BigInt.fromI32(0)
    token.historyDaysCount = BigInt.fromI32(0)
    token.historyMonthsCount = BigInt.fromI32(0)
    token.volume = BigInt.fromI32(0)

    if (address.equals(Address.fromString('0x0000000000000000000000000000000000000000'))) { // Native token
      token.decimals = BigInt.fromI32(18)
      // TODO: Find a way to get the name and symbol of the native token
      token.name = 'xDai'
      token.symbol = 'xDai'
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

      const contract = RealTokenYam.bind(dataSource.address())

      if (contract) {
        const tokenType = contract.try_getTokenType(address)
        switch (tokenType.value) {
          case 1:
            token.type = 'REALTOKEN'
            break
          case 2:
            token.type = 'ERC20WITHPERMIT'
            break
          case 3:
            token.type = 'ERC20WITHOUTPERMIT'
            break
          default:
            token.type = 'NOTWHITELISTEDTOKEN'
        }
      }
    }

    token.save()
  }
  return token
}
