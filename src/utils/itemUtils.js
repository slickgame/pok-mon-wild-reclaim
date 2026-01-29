export function playerHasItem(inventory, name) {
  const item = inventory?.find((entry) => entry.name === name);
  return (item?.quantity || 0) > 0;
}

export function consumeItem(inventory, name, amount = 1) {
  const updatedInventory = inventory.map((entry) => ({ ...entry }));
  const item = updatedInventory.find((entry) => entry.name === name);

  if (!item) {
    return { updatedInventory, item: null };
  }

  item.quantity = Math.max(0, (item.quantity || 0) - amount);

  return { updatedInventory, item };
}
