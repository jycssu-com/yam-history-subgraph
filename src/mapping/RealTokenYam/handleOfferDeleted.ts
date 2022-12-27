import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferDeleted as OfferDeletedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Offer } from '../../types/schema'
import { createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

function saveOnToken (address: Address, offerId: string, block: ethereum.Block): void {
  const token = getToken(address as Address)
  const tokenDay = getTokenDay(token, block.timestamp)
  const tokenMonth = getTokenMonth(token, block.timestamp)

  const tokenDayDeletedOffers = tokenDay.deletedOffers
  tokenDayDeletedOffers.push(offerId)
  tokenDay.deletedOffers = tokenDayDeletedOffers
  tokenDay.deletedOffersCount = BigInt.fromI32(tokenDayDeletedOffers.length)
  tokenDay.save()

  const tokenMonthDeletedOffers = tokenMonth.deletedOffers
  tokenMonthDeletedOffers.push(offerId)
  tokenMonth.deletedOffers = tokenMonthDeletedOffers
  tokenMonth.deletedOffersCount = BigInt.fromI32(tokenMonthDeletedOffers.length)
  tokenMonth.save()
}

function saveOnAccount (address: Address, offerId: string, block: ethereum.Block): void {
  const account = getAccount(address as Address)
  const accountMonth = getAccountMonth(account, block.timestamp)

  const accountMonthDeletedOffers = accountMonth.deletedOffers
  accountMonthDeletedOffers.push(offerId)
  accountMonth.deletedOffers = accountMonthDeletedOffers
  accountMonth.deletedOffersCount = BigInt.fromI32(accountMonthDeletedOffers.length)
  accountMonth.save()
}

export function handleOfferDeleted(event: OfferDeletedEvent): void {
  const offerId = event.params.offerId.toString()
  const offer = Offer.load(offerId)
  if (offer) {
    const wasActive = offer.isActive
    offer.removedAtBlock = event.block.number
    offer.removedAtTimestamp = event.block.timestamp

    const offerQuantity = createOfferQuantity(offerId, BigInt.fromI32(0), 'OfferDeleted', event)
    const quantities = offer.quantities
    quantities.push(offerQuantity.id)
    offer.quantity = offerQuantity.quantity
    offer.quantities = quantities
    offer.quantitiesCount = BigInt.fromI32(quantities.length)
    offer.isActive = false

    offer.save()

    saveOnAccount(Address.fromString(offer.maker), offer.id, event.block)
    saveOnToken(Address.fromString(offer.offerToken), offer.id, event.block)
    saveOnToken(Address.fromString(offer.buyerToken), offer.id, event.block)

    Statistics.increaseOffersDeletedCount()

    if (wasActive) {
      Statistics.decreaseActiveOffersCount()
    }
  }
}
