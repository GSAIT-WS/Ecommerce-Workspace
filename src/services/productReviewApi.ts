import { supabase } from "@/lib/supabaseClient";

interface SubmitProductReviewInput {
  customerId: string;
  productId: string;
  rating: number;
  body: string;
}

export async function submitProductReview({
  customerId,
  productId,
  rating,
  body,
}: SubmitProductReviewInput): Promise<void> {
  const { error } = await supabase
    .schema("ecommerce")
    .from("reviews")
    .insert({
      customer_id: customerId,
      product_id: productId,
      rating,
      body: body.trim(),
    });

  if (error?.code === "23505") {
    throw new Error("You have already reviewed this product.");
  }
  if (error) {
    throw new Error(error.message || "Unable to submit your review. Please try again.");
  }
}
