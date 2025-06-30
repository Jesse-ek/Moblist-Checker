'use strict';

$(function (){
    $(".toggle").on('click', function(){
        if($('.menu').hasClass('active')){
        $('.menu').removeClass('active');
        $(this).find('a').html("<i class='fa-solid fa-bars'></i>");
    } else {
        $('.menu').addClass('active');
        $(this).find('a').html("<i class='fa-solid fa-xmark'></i>");
        }
    })
});


// script.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const walletInput = document.getElementById('wallet-input');
    const checkIcon = document.getElementById('check-icon');
    const whitelistButton = document.getElementById('whitelist-button');
     let validWallets = []; // Will be populated from the Google Sheet

    // Function to load wallets from Google Apps Script
    async function loadWallets() {
        console.log('Attempting to load wallets...');
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbwxUkGLvi_vPNPZAEBhQ5vp2kwiaihoo7e5l_mf67laJqgWefnobJYDgIOjD1QV5whO/exec'); // Replace with your URL
            console.log('Fetch response status:', response.status);
            const data = await response.json();
            validWallets = data.wallets.map(wallet => wallet.trim().toLowerCase()) || [];
            // console.log('Wallets loaded:', validWallets);
        } catch (error) {
            console.error('Error loading wallets:', error, 'Response text:', error.response?.text || 'N/A');
            validWallets = [];
        }
    }

    // Initial load and periodic reload (e.g., every hour for frequent updates)
    loadWallets().then(() => {
        console.log('Initial load complete, running first check...');
        checkWallet(); // Run check after initial load
    });
    setInterval(loadWallets, 60 * 60 * 1000); // Reload every hour

    // Check wallet function
    function checkWallet() {
        const walletAddress = walletInput.value.trim().toLowerCase(); // Normalize input
        // console.log('Checking wallet:', walletAddress, 'against:', validWallets);
        if (walletAddress && validWallets.includes(walletAddress)) {
            checkIcon.innerHTML = '<i class="fas fa-check"></i>'; // Green checkmark
            checkIcon.className = 'status-icon green';
        } else if (walletAddress) {
            checkIcon.innerHTML = '<i class="fas fa-times"></i>'; // Red X
            checkIcon.className = 'status-icon red';
        } else {
            checkIcon.innerHTML = ''; // Clear icon if input is empty
            checkIcon.className = 'status-icon';
        }
    }

    // Debounced check to ensure wallets are loaded
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Check on paste or input change with debounce
    const debouncedCheckWallet = debounce(checkWallet, 300); // 300ms delay
    walletInput.addEventListener('paste', () => {
        setTimeout(debouncedCheckWallet, 0); // Delay to capture pasted value
    });
    walletInput.addEventListener('input', (e) => {
        debouncedCheckWallet(); // Check wallet status
    });


    // Whitelist button redirect
    whitelistButton.addEventListener('click', () => {
        // Replace this URL with your actual form link
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeUeYgK5bLfLAfubf6WXOrG5O4oB7m0AUSLdS4R2jcMwJSsEg/viewform'; // Placeholder URL
        window.open(formUrl, '_blank'); // Opens in a new tab
    });


    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            const targetId = link.getAttribute('href').substring(1); // Get the section ID
            sections.forEach(section => {
                section.style.display = 'none'; // Hide all sections
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block'; // Show the target section
                console.log(`Navigating to ${targetId}, refreshing wallets and clearing input...`);
                walletInput.value = ''; // Clear the input field
                checkIcon.innerHTML = ''; // Reset the checkmark
                checkIcon.className = 'status-icon'; // Reset the class
                loadWallets().then(() => {
                    checkWallet(); // Refresh and recheck after loading
                });
            }
        });
    });

    // Ensure home section is shown by default (handled in CSS now)
});

