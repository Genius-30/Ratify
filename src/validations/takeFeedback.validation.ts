import { z } from "zod";

export const takeFeedbackValidation = z.object({
  isFeedbackTaked: z.boolean(),
});
