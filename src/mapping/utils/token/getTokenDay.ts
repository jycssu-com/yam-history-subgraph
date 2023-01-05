import { BigInt } from '@graphprotocol/graph-ts'
import { Token, TokenDay } from '../../../types/schema'
import { getDay, getFullDay, getMonth, getYear } from '../date'

export function getTokenDay (token: Token, timestamp: BigInt): TokenDay {
  const tokenDayId = token.id + '-' + getFullDay(timestamp)

  let tokenDay = TokenDay.load(tokenDayId)
  if (tokenDay == null) {
    tokenDay = new TokenDay(tokenDayId)
    tokenDay.token = token.id
    tokenDay.year = getYear(timestamp)
    tokenDay.month = getMonth(timestamp)
    tokenDay.day = getDay(timestamp)
    tokenDay.createdOffers = []
    tokenDay.createdOffersCount = BigInt.fromI32(0)
    tokenDay.updatedOffers = []
    tokenDay.updatedOffersCount = BigInt.fromI32(0)
    tokenDay.deletedOffers = []
    tokenDay.deletedOffersCount = BigInt.fromI32(0)
    tokenDay.transactions = []
    tokenDay.transactionsCount = BigInt.fromI32(0)
    tokenDay.volume = BigInt.fromI32(0)
    tokenDay.save()

    token.historyDaysCount = token.historyDaysCount.plus(BigInt.fromI32(1))
    token.save()
  }
  return tokenDay
}
