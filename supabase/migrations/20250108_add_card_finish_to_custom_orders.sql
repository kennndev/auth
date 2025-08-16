-- Add card_finish column to custom_orders table
ALTER TABLE custom_orders 
ADD COLUMN IF NOT EXISTS card_finish TEXT DEFAULT 'matte' 
CHECK (card_finish IN ('matte', 'rainbow', 'gloss'));

-- Add comment to explain the column
COMMENT ON COLUMN custom_orders.card_finish IS 'The finish type selected for custom cards: matte (default), rainbow (+$4), or gloss (+$4)';