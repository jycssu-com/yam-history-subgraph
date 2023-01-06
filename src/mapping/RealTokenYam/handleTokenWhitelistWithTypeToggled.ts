import { ethereum, Bytes, Address } from '@graphprotocol/graph-ts'
import { TokenWhitelistWithTypeToggled as TokenWhitelistWithTypeToggledEvent } from '../../types/RealTokenYam/RealTokenYam'
import { WhitelistedToken } from '../../types/templates'

export function handleTokenWhitelistWithTypeToggled (event: TokenWhitelistWithTypeToggledEvent): void {
  const tokens = getAddresses(event)

  tokens.forEach(token => { WhitelistedToken.create(token) })
}

function getAddresses (event: TokenWhitelistWithTypeToggledEvent): Address[] {
  const inputDataHexString = event.transaction.input.toHexString().slice(10)
  const hexStringToDecode = '0x0000000000000000000000000000000000000000000000000000000000000020' + inputDataHexString
  const dataToDecode = Bytes.fromByteArray(Bytes.fromHexString(hexStringToDecode))
  const decoded = ethereum.decode('(address[],uint256[])', dataToDecode)

  const addresses: Address[] = []
  if (decoded) {
    const tokenAddresses = decoded.toTuple()[0].toAddressArray()
    const tokenTypes = decoded.toTuple()[1].toI32Array()
    for (let i = 0; i < tokenAddresses.length; i++) {
      const token = tokenAddresses[i]
      const type = tokenTypes[i]
      if (type != 0) {
        addresses.push(token)
      }
    }
  }
  return addresses
}
