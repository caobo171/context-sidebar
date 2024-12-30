class UrlPatternMapper {
	patternMap: Map<any, any>;
    constructor() {
        this.patternMap = new Map();
    }

    // Add a URL pattern and its associated value
    add(pattern: string, value: string) {
        const regex = this._convertToRegex(pattern);
        this.patternMap.set(regex, value);
    }

    // Get the value for a URL, if it matches any pattern
    get(url: any) {
        for (const [regex, value] of this.patternMap.entries()) {
            if (regex.test(url)) {
                return value;
            }
        }
        return null; // Return null if no match is found
    }

    // Convert a URL pattern to a regex
    _convertToRegex(pattern: string) {
        const escapedPattern = pattern
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*\*/g, '.*') // ** matches anything
            .replace(/\*/g, '[^/]*'); // * matches any single segment
        return new RegExp(`^${escapedPattern}`);
    }
}

// Example Usage
const urlMapper = new UrlPatternMapper();
urlMapper.add("https://*.rework.*/m*", "standard.message");
urlMapper.add("https://*.rework.*/projects*", "standard.projects");
urlMapper.add("https://*.rework.*/flows*", "standard.flows");

export default urlMapper;