-- Add latitude and longitude columns to addresses table
ALTER TABLE ecommerce.addresses
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

-- Update add_customer_address to accept and store lat/lng
CREATE OR REPLACE FUNCTION ecommerce.add_customer_address(
  p_customer_id   uuid,
  p_label         text,
  p_recipient_name text,
  p_phone         text,
  p_address_line1 text,
  p_address_line2 text DEFAULT NULL,
  p_city          text DEFAULT 'Bangalore',
  p_state         text DEFAULT 'Karnataka',
  p_postal_code   text DEFAULT '',
  p_country       text DEFAULT 'IN',
  p_is_default    boolean DEFAULT false,
  p_latitude      numeric DEFAULT NULL,
  p_longitude     numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_id uuid;
  v_has_addresses boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM ecommerce.addresses WHERE customer_id = p_customer_id)
  INTO v_has_addresses;

  IF NOT v_has_addresses THEN
    p_is_default := true;
  END IF;

  IF p_is_default THEN
    UPDATE ecommerce.addresses SET is_default = false
    WHERE customer_id = p_customer_id AND is_default = true;
  END IF;

  INSERT INTO ecommerce.addresses (
    customer_id, label, recipient_name, phone,
    address_line1, address_line2, city, state, postal_code, country, is_default,
    latitude, longitude
  ) VALUES (
    p_customer_id, p_label, p_recipient_name, p_phone,
    p_address_line1, p_address_line2, p_city, p_state, p_postal_code, p_country, p_is_default,
    p_latitude, p_longitude
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'address_id', v_id);
END;
$$;

-- Update update_customer_address to accept lat/lng
CREATE OR REPLACE FUNCTION ecommerce.update_customer_address(
  p_customer_id   uuid,
  p_address_id    uuid,
  p_label         text DEFAULT NULL,
  p_recipient_name text DEFAULT NULL,
  p_phone         text DEFAULT NULL,
  p_address_line1 text DEFAULT NULL,
  p_address_line2 text DEFAULT NULL,
  p_city          text DEFAULT NULL,
  p_state         text DEFAULT NULL,
  p_postal_code   text DEFAULT NULL,
  p_country       text DEFAULT NULL,
  p_latitude      numeric DEFAULT NULL,
  p_longitude     numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  UPDATE ecommerce.addresses SET
    label          = COALESCE(p_label, label),
    recipient_name = COALESCE(p_recipient_name, recipient_name),
    phone          = COALESCE(p_phone, phone),
    address_line1  = COALESCE(p_address_line1, address_line1),
    address_line2  = COALESCE(p_address_line2, address_line2),
    city           = COALESCE(p_city, city),
    state          = COALESCE(p_state, state),
    postal_code    = COALESCE(p_postal_code, postal_code),
    country        = COALESCE(p_country, country),
    latitude       = CASE WHEN p_latitude IS NOT NULL THEN p_latitude ELSE latitude END,
    longitude      = CASE WHEN p_longitude IS NOT NULL THEN p_longitude ELSE longitude END,
    updated_at     = now()
  WHERE id = p_address_id AND customer_id = p_customer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'address_not_found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'address_id', p_address_id);
END;
$$;
