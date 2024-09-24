<div>
    <input id="phone_number" type="tel" name="{{ $name }}" class="form-control" {{ $attributes }}>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const input = document.querySelector("#phone_number");
            const iti = window.intlTelInput(input, {
                initialCountry: "lk", // Set default country code
                separateDialCode: true,
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
            });

            input.addEventListener('blur', function () {
                const phoneNumber = iti.getNumber();
                if (!iti.isValidNumber()) {
                    alert('Invalid phone number.');
                } else {
                    input.value = phoneNumber; // Store the full phone number with country code
                }
            });
        });
    </script>
</div>
