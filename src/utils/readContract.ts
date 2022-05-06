import { Address, BigDecimal, log } from "@graphprotocol/graph-ts"
import { NewOrder } from "../../generated/NewOrder/NewOrder"
import { Vesting } from "../../generated/NewOrder/Vesting"
import { SLP } from "../../generated/NewOrder/SLP"

// TODO: Figure out cleaner way to handle these helper methods
// For example, maybe we can somehow make just one method for balanceOf that is contract agnostic
export function tryNEWOBalanceOf(contract: NewOrder, address: Address): BigDecimal {
  let balanceOf = BigDecimal.zero()
  let tryBalanceOf = contract.try_balanceOf(address)
  if (!tryBalanceOf.reverted) {
    balanceOf = tryBalanceOf.value.toBigDecimal()
  } else {
    log.info("NEWO balanceOf reverted", [])
  }
  return balanceOf
}

export function tryNEWOBalanceLocked(contract: NewOrder, address: Address): BigDecimal {
  let balanceLocked = BigDecimal.zero()
  let tryBalanceLocked = contract.try_balanceLocked(address)
  if (!tryBalanceLocked.reverted) {
    balanceLocked = tryBalanceLocked.value.toBigDecimal()
  } else {
    log.info("NEWO balanceLocked reverted", [])
  }
  return balanceLocked
}

export function trySLPBalanceOf(contract: SLP, address: Address): BigDecimal {
  let balanceOf = BigDecimal.zero()
  let tryBalanceOf = contract.try_balanceOf(address)
  if (!tryBalanceOf.reverted) {
    balanceOf = tryBalanceOf.value.toBigDecimal()
  } else {
    log.info("SLP balanceOf reverted", [])
  }
  return balanceOf
}

export function tryNEWOTotalSupply(contract: NewOrder): BigDecimal {
  let totalSupply = BigDecimal.zero()
  let tryTotalSupply = contract.try_totalSupply()
  if (!tryTotalSupply.reverted) {
    totalSupply = tryTotalSupply.value.toBigDecimal()
  } else {
    log.info("NEWO totalSupply reverted", [])
  }
  return totalSupply
}

export function trySLPTotalSupply(contract: SLP): BigDecimal {
  let totalSupply = BigDecimal.zero()
  let tryTotalSupply = contract.try_totalSupply()
  if (!tryTotalSupply.reverted) {
    totalSupply = tryTotalSupply.value.toBigDecimal()
  } else {
    log.info("SLP totalSupply reverted", [])
  }
  return totalSupply
}

export function tryCalcMaxWithdraw(contract: Vesting): BigDecimal {
  let maxWithdraw = BigDecimal.zero()
  let tryMaxWithdraw = contract.try_calcMaxWithdraw()
  if (!tryMaxWithdraw.reverted) {
    maxWithdraw = tryMaxWithdraw.value.toBigDecimal()
  } else {
    log.info("Vesting calcMaxWithdraw reverted", [])
  }
  return maxWithdraw
}
