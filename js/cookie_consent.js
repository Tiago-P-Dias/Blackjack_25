// Cookie consent (RGPD / ePrivacy) + Google Analytics 4
//
// Google Analytics is only loaded AFTER the visitor accepts analytics cookies.
// Until then no script is downloaded from Google and no analytics cookie is set.

/**
 * Class that manages the cookie consent banner and the loading of Google Analytics.
 */
class CookieConsent {
    // TODO: replace with your own GA4 Measurement ID (Google Analytics > Admin > Data streams)
    static GA_MEASUREMENT_ID = 'G-L1VEZ0MMYW';
    // Key used to remember the visitor's choice in the browser
    static STORAGE_KEY = 'blackjack_cookie_consent';
    // Version of the consent: increase it to ask for consent again (e.g. after adding new cookies)
    static VERSION = 1;

    /**
     * Creates the manager and wires the banner, the preferences window and the footer link.
     */
    constructor() {
        this.banner = document.getElementById('cookie-banner');
        this.modalElement = document.getElementById('cookie-preferences');
        this.analyticsSwitch = document.getElementById('cookie-analytics');
        this.memoryChoice = null; // Used when the browser does not allow storage
        this.analyticsLoaded = false;

        document.getElementById('cookie-accept').addEventListener('click', () => this.choose(true));
        document.getElementById('cookie-reject').addEventListener('click', () => this.choose(false));
        document.getElementById('cookie-customize').addEventListener('click', () => this.openPreferences());
        document.getElementById('cookie-open-preferences').addEventListener('click', () => this.openPreferences());
        document.getElementById('cookie-save').addEventListener('click', () => this.choose(this.analyticsSwitch.checked));
        document.getElementById('cookie-accept-all').addEventListener('click', () => this.choose(true));
    }

    /**
     * Starts the consent flow: applies a saved choice or shows the banner.
     */
    init() {
        const saved = this.readChoice();

        if (saved) {
            this.apply(saved.analytics);
        } else {
            this.showBanner();
        }
    }

    /**
     * Reads the saved choice.
     * @returns {{analytics: boolean, version: number}|null} - The saved choice or null if there is none (or it is outdated).
     */
    readChoice() {
        let raw = this.memoryChoice;

        try {
            raw = window.localStorage.getItem(CookieConsent.STORAGE_KEY) || raw;
        } catch (error) {
            // Storage blocked: the in-memory choice is used instead
        }

        if (!raw) {
            return null;
        }

        try {
            const choice = JSON.parse(raw);
            return choice.version === CookieConsent.VERSION ? choice : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Saves the visitor's choice.
     * @param {boolean} analytics - Whether analytics cookies were accepted.
     */
    saveChoice(analytics) {
        const raw = JSON.stringify({ analytics, version: CookieConsent.VERSION, date: new Date().toISOString() });
        this.memoryChoice = raw;

        try {
            window.localStorage.setItem(CookieConsent.STORAGE_KEY, raw);
        } catch (error) {
            // Storage blocked: the choice only lasts until the page is closed
        }
    }

    /**
     * Registers the choice, closes the banner / preferences and applies the choice.
     * @param {boolean} analytics - Whether analytics cookies were accepted.
     */
    choose(analytics) {
        this.saveChoice(analytics);
        this.hideBanner();
        this.closePreferences();
        this.apply(analytics);
    }

    /**
     * Applies the choice: loads Google Analytics or turns it off.
     * @param {boolean} analytics - Whether analytics cookies are accepted.
     */
    apply(analytics) {
        this.analyticsSwitch.checked = analytics;

        if (analytics) {
            this.loadAnalytics();
        } else {
            this.disableAnalytics();
        }
    }

    /**
     * Loads Google Analytics (only once) and grants analytics consent.
     */
    loadAnalytics() {
        const id = CookieConsent.GA_MEASUREMENT_ID;

        if (!/^G-[A-Z0-9]{6,}$/.test(id) || id === 'G-L1VEZ0MMYW') {
            console.warn('Cookie consent: set a valid GA_MEASUREMENT_ID in js/cookie_consent.js to enable Google Analytics.');
            return;
        }

        window[`ga-disable-${id}`] = false; // In case it was turned off earlier in this visit

        if (this.analyticsLoaded) {
            this.gtag('consent', 'update', { analytics_storage: 'granted' });
            return;
        }

        window.dataLayer = window.dataLayer || [];
        this.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        this.gtag('js', new Date());
        this.gtag('consent', 'update', { analytics_storage: 'granted' });
        this.gtag('config', id, { anonymize_ip: true });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(script);

        this.analyticsLoaded = true;
    }

    /**
     * Turns Google Analytics off and removes its cookies.
     */
    disableAnalytics() {
        const id = CookieConsent.GA_MEASUREMENT_ID;
        window[`ga-disable-${id}`] = true; // Stops any tracking for the rest of this visit

        if (this.analyticsLoaded) {
            this.gtag('consent', 'update', { analytics_storage: 'denied' });
        }

        this.deleteAnalyticsCookies();
    }

    /**
     * Sends a command to Google's data layer.
     */
    gtag() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments); // gtag.js requires the "arguments" object
    }

    /**
     * Deletes the cookies set by Google Analytics (_ga, _ga_XXXX, _gid, _gat).
     */
    deleteAnalyticsCookies() {
        const names = document.cookie
            .split(';')
            .map(cookie => cookie.split('=')[0].trim())
            .filter(name => name === '_ga' || name === '_gid' || name.startsWith('_ga_') || name.startsWith('_gat'));

        // Cookies may be set on the host or on a parent domain: try every level
        const parts = window.location.hostname.split('.');
        const domains = [''];
        for (let i = 0; i < parts.length - 1; i++) {
            domains.push(`; domain=.${parts.slice(i).join('.')}`);
        }

        names.forEach(name => {
            domains.forEach(domain => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
            });
        });
    }

    /**
     * Shows the banner.
     */
    showBanner() {
        this.banner.hidden = false;
    }

    /**
     * Hides the banner.
     */
    hideBanner() {
        this.banner.hidden = true;
    }

    /**
     * Opens the preferences window (also reachable from the footer to change the choice later).
     */
    openPreferences() {
        const saved = this.readChoice();
        this.analyticsSwitch.checked = saved ? saved.analytics : false;
        bootstrap.Modal.getOrCreateInstance(this.modalElement).show();
    }

    /**
     * Closes the preferences window.
     */
    closePreferences() {
        const modal = bootstrap.Modal.getInstance(this.modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
    window.cookieConsent.init();
});