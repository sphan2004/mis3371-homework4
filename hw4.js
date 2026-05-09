/*
Name: Steven Phan
Date created: 02/27/2026
Date last edited: 02/27/2026
Version: 1.0
Description: Homework 1 JS
*/


// =============================================================
// Fields to save in localStorage (non-secure items only)
// SSN and password are intentionally excluded
// =============================================================
const storageFields = [
    { id: "fname",    key: "ls_fname" },
    { id: "mini",     key: "ls_mini" },
    { id: "lname",    key: "ls_lname" },
    { id: "email",    key: "ls_email" },
    { id: "phone",    key: "ls_phone" },
    { id: "address1", key: "ls_address1" },
    { id: "address2", key: "ls_address2" },
    { id: "city",     key: "ls_city" },
    { id: "zcode",    key: "ls_zcode" },
    { id: "uid",      key: "ls_uid" },
    { id: "notes",    key: "ls_notes" },
    { id: "range",    key: "ls_range" }
];
 
// =============================================================
// Today's date in the header
// =============================================================
const today = new Date();
document.getElementById('today').innerText = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
 
// =============================================================
// FETCH API — load states.json and populate the <select>
// =============================================================
fetch('states.json')
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Could not load states.json: ' + response.status);
        }
        return response.json();
    })
    .then(function(states) {
        var select = document.getElementById('state');
        select.innerHTML = '<option selected disabled>Please Select One</option>';
 
        states.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s.value;
            opt.textContent = s.label;
            select.appendChild(opt);
        });
 
        // After states load, restore saved state from localStorage
        var savedState = localStorage.getItem('ls_state');
        if (savedState) {
            select.value = savedState;
        }
    })
    .catch(function(err) {
        console.error('Fetch error:', err);
        document.getElementById('state').innerHTML =
            '<option selected disabled>Error loading states</option>';
    });
 
// Save state selection to localStorage when it changes
document.getElementById('state').addEventListener('change', function() {
    localStorage.setItem('ls_state', this.value);
});
 
// =============================================================
// LOCAL STORAGE — helpers
// =============================================================
function saveToLocalStorage(key, value) {
    localStorage.setItem('ls_' + key, value);
}
 
function loadFromLocalStorage() {
    storageFields.forEach(function(field) {
        var el = document.getElementById(field.id);
        if (!el) return;
        var saved = localStorage.getItem(field.key);
        if (saved !== null && saved !== "") {
            el.value = saved;
            // Update range label if it's the slider
            if (field.id === 'range') {
                document.getElementById('range-slider').innerText = saved;
            }
        }
    });
 
    // Restore checkboxes
    ['option1','option2','option3','option4'].forEach(function(id) {
        var saved = localStorage.getItem('ls_' + id);
        if (saved === 'true') {
            document.getElementById(id).checked = true;
        }
    });
}
 
function clearLocalStorage() {
    storageFields.forEach(function(field) {
        localStorage.removeItem(field.key);
    });
    localStorage.removeItem('ls_state');
    ['option1','option2','option3','option4'].forEach(function(id) {
        localStorage.removeItem('ls_' + id);
    });
}
 
// Attach onblur localStorage saving to each text/email field
storageFields.forEach(function(field) {
    var el = document.getElementById(field.id);
    if (!el) return;
    el.addEventListener('blur', function() {
        localStorage.setItem(field.key, el.value);
    });
});
 
// Save checkboxes on change
['option1','option2','option3','option4'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
        el.addEventListener('change', function() {
            localStorage.setItem('ls_' + id, el.checked);
        });
    }
});
 
// =============================================================
// COOKIES — helpers (max 2 days per assignment requirement)
// =============================================================
function setCookie(name, cvalue, expiryDays) {
    var day = new Date();
    day.setTime(day.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + day.toUTCString();
    document.cookie = name + "=" + cvalue + ";" + expires + ";path=/";
}
 
function getCookie(name) {
    var cookieName = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}
 
function deleteAllCookies() {
    document.cookie.split(";").forEach(function(cookie) {
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    });
}
 
// =============================================================
// COOKIE + WELCOME MESSAGE logic (runs on page load)
// =============================================================
var firstName = getCookie("firstName");
 
if (firstName !== "") {
    // Returning user — show welcome back message
    document.getElementById("welcome1").innerHTML =
        "Welcome back, <strong>" + firstName + "!</strong>";
    document.getElementById("welcome2").innerHTML =
        "<a href='#' id='new-user'>Not " + firstName + "? Click here to start as a new user.</a>";
 
    // Load all saved localStorage data into the form
    loadFromLocalStorage();
 
    // "Not me" link — expire cookie, clear localStorage, reload
    document.getElementById("new-user").addEventListener("click", function(e) {
        e.preventDefault();
        deleteAllCookies();
        clearLocalStorage();
        location.reload();
    });
 
} else {
    // First-time visitor
    document.getElementById("welcome1").innerHTML = "Welcome, New User!";
    document.getElementById("welcome2").innerHTML = "Please fill out the form below to create your account.";
}
 
// Save first name cookie when user leaves the fname field
document.getElementById("fname").addEventListener("blur", function() {
    var rememberMe = document.getElementById("remember-me").checked;
    if (rememberMe && this.value.trim() !== "") {
        setCookie("firstName", this.value.trim(), 2); // 48 hours
    }
});
 
// =============================================================
// REMEMBER ME checkbox
// =============================================================
document.getElementById("remember-me").addEventListener("change", function() {
    if (!this.checked) {
        // Unchecked — delete everything
        deleteAllCookies();
        clearLocalStorage();
    } else {
        // Re-checked — save current first name cookie and localStorage
        var fname = document.getElementById("fname").value.trim();
        if (fname !== "") {
            setCookie("firstName", fname, 2);
        }
        storageFields.forEach(function(field) {
            var el = document.getElementById(field.id);
            if (el && el.value.trim() !== "") {
                localStorage.setItem(field.key, el.value);
            }
        });
    }
});
 
// On load, if Remember Me is unchecked by default, clear everything
document.addEventListener("DOMContentLoaded", function() {
    if (!document.getElementById("remember-me").checked) {
        deleteAllCookies();
        clearLocalStorage();
    }
});
 
// =============================================================
// VALIDATION FUNCTIONS
// =============================================================
function validateFname() {
    var fname = document.getElementById("fname").value.trim();
    var namePattern = /^[a-zA-Z'-]+$/;
    if (fname === "") {
        document.getElementById("fname-error").innerHTML = "First name cannot be empty";
        return false;
    } else if (!fname.match(namePattern)) {
        document.getElementById("fname-error").innerHTML = "Letters, apostrophes, and dashes only.";
        return false;
    } else if (fname.length < 2) {
        document.getElementById("fname-error").innerHTML = "First name must be at least 2 characters.";
        return false;
    } else if (fname.length > 30) {
        document.getElementById("fname-error").innerHTML = "First name cannot exceed 30 characters.";
        return false;
    } else {
        document.getElementById("fname-error").innerHTML = "";
        return true;
    }
}
 
function validateMini() {
    var mini = document.getElementById("mini").value.toUpperCase();
    document.getElementById("mini").value = mini;
    var namePattern = /^[A-Z]?$/;
    if (!namePattern.test(mini)) {
        document.getElementById("mini-error").innerHTML = "Middle initial must be a single letter";
        return false;
    } else {
        document.getElementById("mini-error").innerHTML = "";
        return true;
    }
}
 
function validateLname() {
    var lname = document.getElementById("lname").value.trim();
    var namePattern = /^[a-zA-Z'-]+$/;
    if (lname === "") {
        document.getElementById("lname-error").innerHTML = "Last name cannot be empty";
        return false;
    } else if (!lname.match(namePattern)) {
        document.getElementById("lname-error").innerHTML = "Letters, apostrophes, and dashes only.";
        return false;
    } else if (lname.length < 2) {
        document.getElementById("lname-error").innerHTML = "Last name must be at least 2 characters.";
        return false;
    } else if (lname.length > 30) {
        document.getElementById("lname-error").innerHTML = "Last name cannot exceed 30 characters.";
        return false;
    } else {
        document.getElementById("lname-error").innerHTML = "";
        return true;
    }
}
 
function validateDob() {
    var dob = document.getElementById("dob");
    var date = new Date(dob.value);
    var maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 120);
 
    if (date > new Date()) {
        document.getElementById("dob-error").innerHTML = "Date can't be in the future";
        dob.value = "";
        return false;
    } else if (date < maxDate) {
        document.getElementById("dob-error").innerHTML = "Date can't be more than 120 years ago";
        dob.value = "";
        return false;
    } else {
        document.getElementById("dob-error").innerHTML = "";
        return true;
    }
}
 
function validateEmail() {
    var email = document.getElementById("email").value;
    var emailR = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email === "") {
        document.getElementById("email-error").innerHTML = "Email can't be blank";
        return false;
    } else if (!emailR.test(email)) {
        document.getElementById("email-error").innerHTML = "Please enter a valid email address";
        return false;
    } else {
        document.getElementById("email-error").innerHTML = "";
        return true;
    }
}
 
function validateSsn() {
    var ssn = document.getElementById("ssn").value;
    var ssnR = /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/;
    if (!ssnR.test(ssn)) {
        document.getElementById("ssn-error").innerHTML = "Please enter a valid SSN";
        return false;
    } else {
        document.getElementById("ssn-error").innerHTML = "";
        return true;
    }
}
 
function validatePhone() {
    var phoneInput = document.getElementById("phone");
    var phone = phoneInput.value.replace(/[^\d]/g, "");
 
    if (!phone) {
        document.getElementById("phone-error").innerHTML = "Phone number can't be blank";
        return false;
    }
 
    if (phone.length > 6) {
        phone = phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6, 10);
    } else if (phone.length > 3) {
        phone = phone.slice(0, 3) + "-" + phone.slice(3, 6);
    } else {
        phone = phone.slice(0, 3);
    }
    phoneInput.value = phone;
 
    if (phone.length !== 12) {
        document.getElementById("phone-error").innerHTML = "Enter a valid phone number (123-456-7890)";
        return false;
    } else {
        document.getElementById("phone-error").innerHTML = "";
        return true;
    }
}
 
function validateAddress1() {
    var addr = document.getElementById("address1").value.trim();
    if (addr.length < 2) {
        document.getElementById("address1-error").innerHTML = "Address can't be blank";
        return false;
    } else {
        document.getElementById("address1-error").innerHTML = "";
        return true;
    }
}
 
function validateAddress2() {
    document.getElementById("address2-error").innerHTML = "";
    return true;
}
 
function validateCity() {
    var city = document.getElementById("city").value.trim();
    if (!city) {
        document.getElementById("city-error").innerHTML = "City can't be blank";
        return false;
    } else {
        document.getElementById("city-error").innerHTML = "";
        return true;
    }
}
 
function validateZcode() {
    var zipInput = document.getElementById("zcode");
    var zip = zipInput.value.replace(/[^\d-]/g, "");
 
    if (!zip) {
        document.getElementById("zcode-error").innerHTML = "Zip code can't be blank";
        return false;
    }
    if (zip.length > 5) {
        zip = zip.slice(0, 5) + "-" + zip.slice(5, 9);
    } else {
        zip = zip.slice(0, 5);
    }
    zipInput.value = zip;
    document.getElementById("zcode-error").innerHTML = "";
    return true;
}
 
function validateUid() {
    var uid = document.getElementById("uid").value.toLowerCase();
    document.getElementById("uid").value = uid;
    var regex = /^[a-zA-Z0-9_-]+$/;
 
    if (uid.length === 0) {
        document.getElementById("uid-error").innerHTML = "User ID can't be blank";
        return false;
    } else if (!isNaN(uid.charAt(0))) {
        document.getElementById("uid-error").innerHTML = "User ID can't start with a number";
        return false;
    } else if (!regex.test(uid)) {
        document.getElementById("uid-error").innerHTML = "Letters, numbers, underscores, and dashes only";
        return false;
    } else if (uid.length < 5) {
        document.getElementById("uid-error").innerHTML = "User ID must be at least 5 characters";
        return false;
    } else if (uid.length > 30) {
        document.getElementById("uid-error").innerHTML = "User ID can't exceed 30 characters";
        return false;
    } else {
        document.getElementById("uid-error").innerHTML = "";
        return true;
    }
}
 
function validatePword() {
    var pword = document.getElementById("pword").value;
    var uid = document.getElementById("uid").value;
    var msgs = [];
 
    if (!pword.match(/[a-z]/))           msgs.push("At least one lowercase letter");
    if (!pword.match(/[A-Z]/))           msgs.push("At least one uppercase letter");
    if (!pword.match(/[0-9]/))           msgs.push("At least one number");
    if (!pword.match(/[!@#$%&*\-_\\.+()]/)) msgs.push("At least one special character");
    if (uid && pword.includes(uid))      msgs.push("Password cannot contain your User ID");
 
    var errEl = document.getElementById("pword-error");
    if (msgs.length > 0) {
        errEl.innerHTML = msgs.join(" &bull; ");
        return false;
    } else {
        errEl.innerHTML = "";
        return true;
    }
}
 
function validatePwordConfirm() {
    var pword1 = document.getElementById("pword").value;
    var pword2 = document.getElementById("pword_confirm").value;
    var errEl = document.getElementById("pword_confirm-error");
 
    if (pword2 === "") {
        errEl.innerHTML = "";
        return false;
    } else if (pword1 !== pword2) {
        errEl.style.color = "red";
        errEl.innerHTML = "Passwords don't match";
        return false;
    } else {
        errEl.style.color = "green";
        errEl.innerHTML = "Passwords match ✓";
        return true;
    }
}
 
// =============================================================
// REVIEW button — display all entered form values in a table
// =============================================================
function reviewInput() {
    var form = document.querySelector("form");
    var output = "<table class='output'><tr><th colspan='2'>Review Your Information:</th></tr>";
 
    for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        var type = el.type;
        var name = el.name;
        var value = el.value;
 
        if (!name) continue;
 
        switch (type) {
            case "checkbox":
                if (el.checked && name !== "remember-me") {
                    output += "<tr><td align='right'>" + name + "</td><td class='outputdata'>&#x2713;</td></tr>";
                }
                break;
            case "radio":
                if (el.checked) {
                    output += "<tr><td align='right'>" + name + "</td><td class='outputdata'>" + value + "</td></tr>";
                }
                break;
            case "range":
                output += "<tr><td align='right'>" + name + "</td><td class='outputdata'>" + value + "</td></tr>";
                break;
            case "password":
                // Never show passwords in review
                break;
            case "button":
            case "submit":
            case "reset":
                break;
            default:
                if (value !== "") {
                    output += "<tr><td align='right'>" + name + "</td><td class='outputdata'>" + value + "</td></tr>";
                }
        }
    }
 
    output += "</table>";
    document.getElementById("showInput").innerHTML = output;
}
 
// =============================================================
// ALERT BOX
// =============================================================
function showAlert() {
    var alertBox = document.getElementById("alert-box");
    alertBox.style.display = "block";
    document.getElementById("close-alert").onclick = function() {
        alertBox.style.display = "none";
    };
}
