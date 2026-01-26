import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, itemData, quantity } = await req.json();

    if (action === 'addItem') {
      // Check if item already exists in inventory
      const existing = await base44.entities.Inventory.filter({
        created_by: user.email,
        itemId: itemData.itemId || itemData.id || itemData.name
      });

      if (existing.length > 0) {
        // Update existing quantity
        const item = existing[0];
        await base44.entities.Inventory.update(item.id, {
          quantity: item.quantity + quantity
        });

        return Response.json({
          success: true,
          action: 'updated',
          newQuantity: item.quantity + quantity
        });
      } else {
        // Create new inventory entry
        await base44.entities.Inventory.create({
          itemId: itemData.itemId || itemData.id || itemData.name,
          name: itemData.name,
          type: itemData.type,
          rarity: itemData.rarity || 'Common',
          tier: itemData.tier || 1,
          description: itemData.description || '',
          effects: itemData.effects || '',
          quantity: quantity,
          sellValue: itemData.sellValue || 0,
          iconUrl: itemData.iconUrl || ''
        });

        return Response.json({
          success: true,
          action: 'created',
          quantity: quantity
        });
      }
    }

    if (action === 'removeItem') {
      const { itemId, amount } = itemData;
      
      const existing = await base44.entities.Inventory.filter({
        created_by: user.email,
        itemId: itemId
      });

      if (existing.length === 0) {
        return Response.json({ error: 'Item not found' }, { status: 404 });
      }

      const item = existing[0];
      const newQuantity = item.quantity - amount;

      if (newQuantity <= 0) {
        // Delete item
        await base44.entities.Inventory.delete(item.id);
        return Response.json({
          success: true,
          action: 'deleted'
        });
      } else {
        // Update quantity
        await base44.entities.Inventory.update(item.id, {
          quantity: newQuantity
        });

        return Response.json({
          success: true,
          action: 'updated',
          newQuantity: newQuantity
        });
      }
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Inventory manager error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});