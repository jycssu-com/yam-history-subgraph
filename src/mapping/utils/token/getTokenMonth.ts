import { BigInt } from '@graphprotocol/graph-ts'
import { Token, TokenMonth } from '../../../types/schema'
import { getFullMonth, getMonth, getYear } from '../date'

export function getTokenMonth (token: Token, timestamp: BigInt): TokenMonth {
  const tokenMonthId = token.id + '-' + getFullMonth(timestamp)

  let tokenMonth = TokenMonth.load(tokenMonthId)
  if (tokenMonth == null) {
    tokenMonth = new TokenMonth(tokenMonthId)
    tokenMonth.token = token.id
    tokenMonth.year = getYear(timestamp)
    tokenMonth.month = getMonth(timestamp)
    tokenMonth.createdOffersCount = BigInt.fromI32(0)
    tokenMonth.updatedOffersCount = BigInt.fromI32(0)
    tokenMonth.deletedOffersCount = BigInt.fromI32(0)
    tokenMonth.transactionsCount = BigInt.fromI32(0)
    tokenMonth.volume = BigInt.fromI32(0)
    tokenMonth.save()

    token.historyMonthsCount = token.historyMonthsCount.plus(BigInt.fromI32(1))
    token.save()
  }
  return tokenMonth
}
