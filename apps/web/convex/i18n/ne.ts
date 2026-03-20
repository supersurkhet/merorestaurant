export const ne: Record<string, string> = {
  "order.not_found": "अर्डर फेला परेन",
  "order.empty_items": "अर्डरमा कम्तिमा एउटा वस्तु हुनुपर्छ",
  "order.already_cancelled": "अर्डर पहिले नै रद्द भइसकेको छ",
  "order.already_completed": "अर्डर पहिले नै पूरा भइसकेको छ",
  "order.cannot_cancel":
    "अर्डर रद्द गर्न सकिँदैन किनभने यो पहिले नै {status} छ",
  "order.invalid_status_transition":
    "अर्डरको स्थिति {from} बाट {to} मा परिवर्तन गर्न सकिँदैन",
  "menu.item_unavailable": '"{name}" हाल उपलब्ध छैन',
  "menu.item_not_found": "मेनु वस्तु फेला परेन: {id}",
  "menu.category_has_items":
    "मेनु वस्तुहरू भएको श्रेणी मेटाउन सकिँदैन। पहिले हटाउनुहोस् वा पुन: तोक्नुहोस्।",
  "table.not_found": "टेबल फेला परेन",
  "table.already_occupied": "टेबल पहिले नै ओक्युपाइड छ",
  "table.cannot_delete_occupied": "ओक्युपाइड टेबल मेटाउन सकिँदैन",
  "table.qr_code_in_use": 'QR कोड "{qrCode}" पहिले नै प्रयोगमा छ',
  "payment.not_found": "भुक्तानी फेला परेन",
  "payment.already_completed": "भुक्तानी पहिले नै पूरा भइसकेको छ",
  "payment.invalid_amount":
    "भुक्तानी रकम अर्डरको कुल रकमसँग मिल्दैन",
  "auth.unauthorized": "तपाईंलाई यो कार्य गर्न अनुमति छैन",
  "auth.role_required": "यो कार्यका लागि {role} भूमिका आवश्यक छ",
  "auth.no_active_staff": "यस प्रयोगकर्ताको लागि सक्रिय कर्मचारी खाता छैन",
  "auth.invalid_jwt": "अमान्य JWT ढाँचा",
  "auth.jwt_expired": "JWT म्याद सकिएको छ",
  "auth.access_denied":
    'पहुँच अस्वीकृत: [{roles}] मध्ये एउटा आवश्यक छ, तपाईंसँग "{current}" छ',
  "wifi.not_configured":
    "यस रेस्टुरेन्टको लागि WiFi कन्फिगर गरिएको छैन",
  "restaurant.not_found": "रेस्टुरेन्ट फेला परेन",
  "restaurant.slug_taken":
    'स्लग "{slug}" भएको रेस्टुरेन्ट पहिले नै छ',
  "seed.already_seeded":
    "डाटाबेस पहिले नै सिड गरिएको छ (mero-surkhet अवस्थित छ)",
  "staff.not_found": "कर्मचारी फेला परेन",
};
