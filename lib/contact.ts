/**
 * Contact channels shown in the header's top strip.
 *
 * 16922 is an Egyptian short-code hotline, so it is dialled as-is: short
 * codes do not take the +20 country prefix. WhatsApp wants the full
 * international number — 01200016922 with the leading 0 swapped for 20.
 */
export const PHONE_DISPLAY = "16922";
export const PHONE_HREF = "tel:16922";
export const WHATSAPP_HREF = "https://wa.me/201200016922?text=Hi";

/** Qatari Diar Egypt's social profiles, shown in the top strip. */
export const FACEBOOK_HREF = "https://www.facebook.com/qataridiaregypt";
export const INSTAGRAM_HREF = "https://www.instagram.com/qataridiaregypt/";

import { asset } from "./asset";

/**
 * The sales brochure, served with the site so the button can save it
 * straight to the device (the `download` attribute only works same-origin).
 * Replace the file in place to update it — keep the name, so old versions
 * do not pile up in the repository's history.
 */
export const BROCHURE_HREF = asset("/brochure/Alam-Al-Roum-Brochure.pdf");
export const BROCHURE_FILENAME = "Alam-Al-Roum-Brochure.pdf";
