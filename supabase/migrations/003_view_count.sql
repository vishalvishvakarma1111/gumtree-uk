-- Increment listing.views_count.
-- SECURITY DEFINER so anon + authenticated roles can call it without
-- needing UPDATE permission on the listings table (RLS update policy
-- restricts to owner only).

CREATE OR REPLACE FUNCTION public.increment_listing_view(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.listings
  SET views_count = views_count + 1
  WHERE id = p_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_listing_view(uuid) TO anon, authenticated;
