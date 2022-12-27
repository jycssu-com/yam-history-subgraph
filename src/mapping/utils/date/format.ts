import { BigInt } from '@graphprotocol/graph-ts'

export function getYear (timestamp: BigInt): string {
  const date = new Date(timestamp.toI64() * 1000)
  return date.getUTCFullYear().toString()
}

export function getMonth (timestamp: BigInt): string {
  const date = new Date(timestamp.toI64() * 1000)
  return (date.getUTCMonth() + 1).toString().padStart(2, '0')
}

export function getDay (timestamp: BigInt): string {
  const date = new Date(timestamp.toI64() * 1000)
  return date.getUTCDate().toString().padStart(2, '0')
}

export function getFullMonth (timestamp: BigInt): string {
  return getYear(timestamp) + '-' + getMonth(timestamp)
}

export function getFullDay (timestamp: BigInt): string {
  return getFullMonth(timestamp) + '-' + getDay(timestamp)
}
