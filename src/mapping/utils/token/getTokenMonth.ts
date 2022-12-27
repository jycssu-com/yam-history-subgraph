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
    tokenMonth.createdOffers = []
    tokenMonth.createdOffersCount = BigInt.fromI32(0)
    tokenMonth.updatedOffers = []
    tokenMonth.updatedOffersCount = BigInt.fromI32(0)
    tokenMonth.deletedOffers = []
    tokenMonth.deletedOffersCount = BigInt.fromI32(0)
    tokenMonth.transactions = []
    tokenMonth.transactionsCount = BigInt.fromI32(0)
    tokenMonth.volume = BigInt.fromI32(0)
    tokenMonth.save()

    const historyMonths = token.historyMonths
    historyMonths.push(tokenMonthId)
    token.historyMonths = historyMonths
    token.historyMonthsCount = BigInt.fromI32(historyMonths.length)
    token.save()
  }
  return tokenMonth
}
