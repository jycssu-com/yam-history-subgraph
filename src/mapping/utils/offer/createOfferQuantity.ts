import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { OfferQuantity } from '../../../types/schema'

export function createOfferQuantity (
  offerId: string,
  quantity: BigInt,
  origin: string,
  event: ethereum.Event,
): OfferQuantity {
  const offerQuantityId = event.transaction.hash.toHex() + event.logIndex.toString()
  const offerQuantity = new OfferQuantity(offerQuantityId)
  offerQuantity.offer = offerId
  offerQuantity.quantity = quantity
  offerQuantity.origin = origin
  offerQuantity.createdAtBlock = event.block.number
  offerQuantity.createdAtTimestamp = event.block.timestamp
  offerQuantity.save()
  return offerQuantity
}
