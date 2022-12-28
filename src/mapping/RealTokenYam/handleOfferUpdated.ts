import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferUpdated as OfferUpdatedEvent } from '../../types/RealTokenYam/RealTokenYam'
import { Offer } from '../../types/schema'
import { createOfferPrice, createOfferQuantity, getAccount, getAccountMonth, getToken, getTokenDay, getTokenMonth } from '../utils'
import { isActiveOffer } from '../utils'
import { Statistics } from '../utils/statistics/Statistics'

function saveOnToken (address: Address, offerId: string, block: ethereum.Block): void {
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

function saveOnAccount (address: Address, offerId: string, block: ethereum.Block): void {
  const account = getAccount(address as Address)
  const accountMonth = getAccountMonth(account, block.timestamp)

  const accountMonthUpdatedOffers = accountMonth.updatedOffers
  accountMonthUpdatedOffers.push(offerId)
  accountMonth.updatedOffers = accountMonthUpdatedOffers
  accountMonth.updatedOffersCount = BigInt.fromI32(accountMonthUpdatedOffers.length)
  accountMonth.save()
}

export function handleOfferUpdated(event: OfferUpdatedEvent): void {
  const offer = Offer.load(event.params.offerId.toString())
  if (offer) {
    const wasActive = offer.isActive
    const hasPriceChanged = event.params.newPrice !== event.params.oldPrice
    const hasQuantityChanged = event.params.newAmount !== event.params.oldAmount

    if (hasPriceChanged) {
      const offerPrice = createOfferPrice(offer.id, event.params.newPrice, event)
      const prices = offer.prices
      prices.push(offerPrice.id)
      offer.price = offerPrice.price
      offer.prices = prices
      offer.pricesCount = BigInt.fromI32(prices.length)
    }

    if (hasQuantityChanged) {
      const offerQuantity = createOfferQuantity(offer.id, event.params.newAmount, 'OfferUpdated', event)
      const quantities = offer.quantities
      quantities.push(offerQuantity.id)
      offer.quantity = offerQuantity.quantity
      offer.quantities = quantities
      offer.quantitiesCount = BigInt.fromI32(quantities.length)
    }

    offer.isActive = isActiveOffer(offer)
    offer.save()

    saveOnAccount(Address.fromString(offer.maker), offer.id, event.block)
    saveOnToken(Address.fromString(offer.offerToken), offer.id, event.block)
    saveOnToken(Address.fromString(offer.buyerToken), offer.id, event.block)

    if (offer.pricesCount.equals(BigInt.fromI32(2))) {
      Statistics.increaseOffersWithPriceChangesCount()
    }

    if (offer.isActive && !wasActive) {
      Statistics.increaseActiveOffersCount()
    } else if (!offer.isActive && wasActive) {
      Statistics.decreaseActiveOffersCount()
    }
  }
}