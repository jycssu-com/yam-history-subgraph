import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferUpdated as OfferUpdatedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Offer, OfferPrice, OfferQuantity } from '../../types/schema'
import { createOfferPrice, createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

export function handleOfferUpdated (event: OfferUpdatedEvent): void {
  const offer = Offer.load(event.params.offerId.toString())
  if (offer) {
    const wasActive = offer.isActive
    const hasPriceChanged = event.params.newPrice !== event.params.oldPrice
    const hasQuantityChanged = event.params.newAmount !== event.params.oldAmount

    if (hasPriceChanged) {
      updateOfferPrice(offer, event)
    }

    if (hasQuantityChanged) {
      updateOfferQuantity(offer, event)
    }

    offer.isActive = isActiveOffer(offer)
    offer.save()

    updateRelatedAccount(Address.fromString(offer.maker), offer.id, event.block)
    updateRelatedToken(Address.fromString(offer.offerToken), offer.id, event.block)
    updateRelatedToken(Address.fromString(offer.buyerToken), offer.id, event.block)
    updateStatistics(offer, wasActive)
  }
}

function updateOfferPrice (offer: Offer, event: OfferUpdatedEvent): OfferPrice {
  const offerPrice = createOfferPrice(offer.id, event.params.newPrice, event)
  offer.pricesCount = offer.pricesCount.plus(BigInt.fromI32(1))
  return offerPrice
}

function updateOfferQuantity (offer: Offer, event: OfferUpdatedEvent): OfferQuantity {
  const offerQuantity = createOfferQuantity(offer.id, event.params.newAmount, 'OfferUpdated', event)
  offer.quantitiesCount = offer.quantitiesCount.plus(BigInt.fromI32(1))
  return offerQuantity
}

function updateRelatedAccount (address: Address, offerId: string, block: ethereum.Block): void {
  const account = getAccount(address as Address)
  const accountMonth = getAccountMonth(account, block.timestamp)

  const accountMonthUpdatedOffers = accountMonth.updatedOffers
  accountMonthUpdatedOffers.push(offerId)
  accountMonth.updatedOffers = accountMonthUpdatedOffers
  accountMonth.updatedOffersCount = BigInt.fromI32(accountMonthUpdatedOffers.length)
  accountMonth.save()
}

function updateRelatedToken (address: Address, offerId: string, block: ethereum.Block): void {
  const token = getToken(address as Address)
  const tokenDay = getTokenDay(token, block.timestamp)
  const tokenMonth = getTokenMonth(token, block.timestamp)

  const tokenDayUpdatedOffers = tokenDay.updatedOffers
  tokenDayUpdatedOffers.push(offerId)
  tokenDay.updatedOffers = tokenDayUpdatedOffers
  tokenDay.updatedOffersCount = BigInt.fromI32(tokenDayUpdatedOffers.length)
  tokenDay.save()

  const tokenMonthUpdatedOffers = tokenMonth.updatedOffers
  tokenMonthUpdatedOffers.push(offerId)
  tokenMonth.updatedOffers = tokenMonthUpdatedOffers
  tokenMonth.updatedOffersCount = BigInt.fromI32(tokenMonthUpdatedOffers.length)
  tokenMonth.save()
}

function updateStatistics (offer: Offer, wasActive: boolean): void {
  if (offer.pricesCount.equals(BigInt.fromI32(2))) {
    Statistics.increaseOffersWithPriceChangesCount()
  }

  if (offer.isActive && !wasActive) {
    Statistics.increaseActiveOffersCount()
  } else if (!offer.isActive && wasActive) {
    Statistics.decreaseActiveOffersCount()
  }
}
