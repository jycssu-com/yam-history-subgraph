import { BigInt } from '@graphprotocol/graph-ts'
import { Offer } from '../../../types/schema'

export function isActiveOffer (offer: Offer): boolean {
  if (offer.removedAtBlock) {
    return false
  }

  if (offer.quantity.le(BigInt.fromI32(0))) {
    return false
  }

  return true
}