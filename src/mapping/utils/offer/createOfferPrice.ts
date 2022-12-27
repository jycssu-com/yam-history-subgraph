import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferPrice } from '../../../types/schema'

export function createOfferPrice (
  offerId: string,
  price: BigInt,
  event: ethereum.Event,
): OfferPrice {
  const offerPriceId = event.transaction.hash.toHex() + event.logIndex.toString()
  const offerPrice = new OfferPrice(offerPriceId)
  offerPrice.offer = offerId
  offerPrice.price = price
  offerPrice.createdAtBlock = event.block.number
  offerPrice.createdAtTimestamp = event.block.timestamp
  offerPrice.save()
  return offerPrice
}
