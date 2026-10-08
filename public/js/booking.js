const bookingForm = document.getElementById("booking-form");

if (bookingForm) {
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    const breakdown = document.getElementById("booking-breakdown");
    const nightsElement = document.getElementById("booking-nights");
    const basePriceElement = document.getElementById("booking-base-price");
    const gstElement = document.getElementById("booking-gst");
    const totalElement = document.getElementById("booking-total");

    const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

    const updateBookingTotal = () => {
        const checkIn = new Date(`${checkInInput.value}T00:00:00`);
        const checkOut = new Date(`${checkOutInput.value}T00:00:00`);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (!checkInInput.value || !checkOutInput.value || nights <= 0) {
            breakdown.hidden = true;
            return;
        }

        const basePrice = nights * bookingPrice;
        const gst = Math.round(basePrice * 0.18);
        const total = basePrice + gst;
        nightsElement.textContent = nights;
        basePriceElement.textContent = formatPrice(basePrice);
        gstElement.textContent = formatPrice(gst);
        totalElement.textContent = formatPrice(total);
        breakdown.hidden = false;
    };

    checkInInput.addEventListener("change", updateBookingTotal);
    checkOutInput.addEventListener("change", updateBookingTotal);
}
