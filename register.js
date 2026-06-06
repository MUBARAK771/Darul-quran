document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admission-form');
    const steps = document.querySelectorAll('.step-content');
    const tabs = document.querySelectorAll('.tab');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentIndex = 0; // zero-based index into steps/tabs
    const totalSteps = steps.length;

    // Payment plan elements
    const paymentPlanRadios = document.querySelectorAll('input[name="payment-plan"]');
    const paymentTotalEl = document.getElementById('payment-total');
    const paymentNowEl = document.getElementById('payment-now');
    const paymentNowRow = document.getElementById('payment-now-row');

    // constants
    const FORM_FEE = 3000;
    const ENTRY_FEE = 130000;
    const TOTAL_NAIRA = FORM_FEE + ENTRY_FEE;

    function updatePaymentDisplay() {
        const plan = document.querySelector('input[name="payment-plan"]:checked')?.value || 'full';
        // total always shown
        if (paymentTotalEl) paymentTotalEl.textContent = `₦${TOTAL_NAIRA.toLocaleString()}`;

        if (plan === 'full') {
            if (paymentNowEl) paymentNowEl.textContent = `₦${TOTAL_NAIRA.toLocaleString()}`;
        } else {
            // 3 installments, charge first installment now (rounded up)
            const installment = Math.ceil(TOTAL_NAIRA / 3);
            if (paymentNowEl) paymentNowEl.textContent = `₦${installment.toLocaleString()}`;
        }
    }

    // attach listeners to radios
    paymentPlanRadios.forEach(r => r.addEventListener('change', updatePaymentDisplay));

    function updateForm() {
        // Toggle Step Body (use order index so missing numbered steps don't break flow)
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === currentIndex);
        });

        // Toggle Tabs (match by order)
        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === currentIndex);
        });

        // Update Buttons
        if (currentIndex === 0) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        if (currentIndex === totalSteps - 1) {
            nextBtn.innerHTML = 'Process Payment <i class="fa-solid fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'Continue <i class="fa-solid fa-arrow-right"></i>';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSteps - 1) {
            // Validate basic inputs in current step before proceeding
            const currentStepEl = steps[currentIndex];
            const inputs = currentStepEl.querySelectorAll('input, select, textarea');
            let valid = true;
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value) {
                    input.style.borderColor = '#e74c3c';
                    valid = false;
                } else {
                    input.style.borderColor = '#eee';
                }
            });

            if (valid) {
                currentIndex++;
                updateForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.log('Please fill in all required fields marked with *');
            }
        } else {
            // Final Submit -> trigger Paystack payment flow
            const terms = document.querySelector('input[type="checkbox"]');
            if (!terms.checked) {
                alert('Please agree to the terms and conditions');
                return;
            }

            // Payment details (amounts in Naira)
            // Determine amount to charge now based on selected plan
            const plan = document.querySelector('input[name="payment-plan"]:checked')?.value || 'full';
            let amountToChargeNaira = TOTAL_NAIRA;
            if (plan === 'installments') {
                amountToChargeNaira = Math.ceil(TOTAL_NAIRA / 3);
            }
            const amountKobo = amountToChargeNaira * 100; // Paystack uses kobo

            // Paystack public key - replace with your live/test key
            const PAYSTACK_PUBLIC_KEY = 'pk_test_73f2fe151d6d3c6f532fcda46bcf5b866537591d';

            const emailInput = document.getElementById('email');
            const email = emailInput ? emailInput.value : '';

            if (!window.PaystackPop) {
                alert('Payment gateway not loaded. Try again later.');
                return;
            }

            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: email,
                amount: amountKobo,
                currency: 'NGN',
                ref: 'DARULQURAN_' + Math.floor((Math.random() * 1000000000) + 1),
                metadata: {
                    custom_fields: [
                        { display_name: 'Full Name', variable_name: 'full_name', value: `${document.getElementById('fname').value} ${document.getElementById('lname').value}` }
                    ]
                },
                callback: function(response) {
                    // Payment successful - you may want to verify transaction on server-side
                    alert('Payment successful. Transaction reference: ' + response.reference);
                    // Optionally submit the form data to server here
                    // For now, redirect to a success page
                    window.location.href = 'index.html';
                },
                onClose: function() {
                    alert('Payment window closed. Payment was not completed.');
                }
            });

            handler.openIframe();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateForm();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Initial setup
    updateForm();
    updatePaymentDisplay();
});
