// URL Extraction and Management
class URLExtractor {
    constructor(storageManager, authManager) {
        this.storage = storageManager;
        this.auth = authManager;
        this.security = new SecurityManager();
        this.currentExtraction = null;
        this.maxUrls = 1000; // Free tier limit
        this.premiumMaxUrls = 10000; // Premium tier limit
        this.rateLimiter = this.security.createRateLimiter(10, 60000); // 10 extractions per minute
    }

    // Extract URLs from text
    extractFromText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Valid text is required');
        }

        // Security validation
        const textValidation = this.security.validateTextInput(text);
        if (!textValidation.valid) {
            throw new Error(textValidation.error);
        }

        // Use secure URL extraction
        const urls = this.security.extractUrls(textValidation.sanitized);
        
        // Apply user limits
        return urls.slice(0, this.getMaxUrls());
    }

    // Extract URLs from webpage (simulated - in real app would use backend)
    async extractFromWebpage(webpageUrl) {
        try {
            // Rate limiting
            if (!this.rateLimiter.isAllowed('extraction')) {
                throw new Error('Too many extraction attempts. Please try again later.');
            }

            if (!webpageUrl) {
                throw new Error('Webpage URL is required');
            }

            // Security validation
            const urlValidation = this.security.validateUrl(webpageUrl);
            if (!urlValidation.valid) {
                throw new Error(urlValidation.error);
            }

            // In a real implementation, this would make a backend request
            // For demo purposes, we'll simulate extracting URLs from a page
            const simulatedUrls = await this.simulateWebpageExtraction(urlValidation.sanitized);
            
            return simulatedUrls.slice(0, this.getMaxUrls());
            
        } catch (error) {
            console.error('Webpage extraction error:', error);
            throw new Error('Failed to extract URLs from webpage');
        }
    }

    // Simulate webpage extraction (for demo)
    async simulateWebpageExtraction(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simulate extracting URLs from the page
        const baseUrl = new URL(url).origin;
        const paths = [
            '/about',
            '/contact',
            '/products',
            '/services',
            '/blog',
            '/login',
            '/register',
            '/dashboard',
            '/profile',
            '/settings',
            '/help',
            '/faq',
            '/terms',
            '/privacy',
            '/api/v1/users',
            '/api/v1/products',
            '/cdn/images/logo.png',
            '/cdn/css/styles.css',
            '/cdn/js/app.js'
        ];

        const urls = paths.slice(0, 5 + Math.floor(Math.random() * 10))
            .map(path => baseUrl + path);

        return urls;
    }

    // Validate URL
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Get max URLs limit based on user tier
    getMaxUrls() {
        if (this.auth.isPremium()) {
            return this.premiumMaxUrls;
        }
        return this.maxUrls;
    }

    // Check if user can extract more URLs
    canExtract(urlCount) {
        const maxUrls = this.getMaxUrls();
        return urlCount <= maxUrls;
    }

    // Create extraction record
    createExtractionRecord(source, urls, type = 'text') {
        const record = {
            id: Date.now().toString(),
            type,
            source: source.length > 100 ? source.substring(0, 100) + '...' : source,
            urlCount: urls.length,
            urls: urls,
            timestamp: new Date().toISOString(),
            userId: this.auth.getCurrentUser()?.email || 'anonymous',
            exported: false
        };

        return record;
    }

    // Save extraction to history
    async saveExtraction(source, urls, type = 'text') {
        if (!this.auth.isAuthenticated()) {
            throw new Error('You must be signed in to save extractions');
        }

        const record = this.createExtractionRecord(source, urls, type);
        
        // Save to storage
        const success = this.storage.addExtractionItem(record);
        if (!success) {
            throw new Error('Failed to save extraction');
        }

        // Update user stats
        this.auth.updateUserStats(1, urls.length);

        return record;
    }

    // Get extraction history
    getExtractionHistory() {
        if (!this.auth.isAuthenticated()) {
            return [];
        }

        return this.storage.getExtractionHistory();
    }

    // Delete extraction from history
    async deleteExtraction(id) {
        const success = this.storage.removeExtractionItem(id);
        if (!success) {
            throw new Error('Failed to delete extraction');
        }

        return true;
    }

    // Clear extraction history
    async clearExtractionHistory() {
        const success = this.storage.clearExtractionHistory();
        if (!success) {
            throw new Error('Failed to clear history');
        }

        return true;
    }

    // Export URLs to different formats
    exportUrls(urls, format = 'json') {
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            throw new Error('No URLs to export');
        }

        let content = '';
        let mimeType = '';
        let fileExtension = '';

        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify(urls, null, 2);
                mimeType = 'application/json';
                fileExtension = 'json';
                break;

            case 'csv':
                content = 'URL\n' + urls.join('\n');
                mimeType = 'text/csv';
                fileExtension = 'csv';
                break;

            case 'txt':
            case 'text':
                content = urls.join('\n');
                mimeType = 'text/plain';
                fileExtension = 'txt';
                break;

            case 'html':
                content = this.generateHtmlList(urls);
                mimeType = 'text/html';
                fileExtension = 'html';
                break;

            default:
                throw new Error('Unsupported export format');
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const filename = `extracted-urls-${Date.now()}.${fileExtension}`;
        
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);

        return { filename, size: content.length };
    }

    // Generate HTML list of URLs
    generateHtmlList(urls) {
        const list = urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extracted URLs</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Extracted URLs (${urls.length} URLs)</h1>
    <ul>${list}</ul>
    <p>Generated on ${new Date().toLocaleString()}</p>
</body>
</html>`;
    }

    // Copy URLs to clipboard
    async copyUrlsToClipboard(urls) {
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            throw new Error('No URLs to copy');
        }

        try {
            const text = urls.join('\n');
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard copy error:', error);
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = urls.join('\n');
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                throw new Error('Failed to copy URLs to clipboard');
            }
        }
    }

    // Analyze URLs
    analyzeUrls(urls) {
        if (!urls || !Array.isArray(urls)) {
            return null;
        }

        const domains = {};
        const protocols = {};
        const extensions = {};

        urls.forEach(url => {
            try {
                const urlObj = new URL(url);
                
                // Count domains
                const domain = urlObj.hostname;
                domains[domain] = (domains[domain] || 0) + 1;

                // Count protocols
                const protocol = urlObj.protocol;
                protocols[protocol] = (protocols[protocol] || 0) + 1;

                // Count file extensions
                const pathname = urlObj.pathname;
                const extension = pathname.split('.').pop();
                if (extension && extension.length <= 10) {
                    extensions[extension] = (extensions[extension] || 0) + 1;
                }
            } catch (error) {
                // Invalid URL, skip
            }
        });

        return {
            totalUrls: urls.length,
            uniqueDomains: Object.keys(domains).length,
            topDomains: Object.entries(domains)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([domain, count]) => ({ domain, count })),
            protocols,
            extensions
        };
    }

    // Display extraction results
    displayResults(urls) {
        const resultsDiv = document.getElementById('extractResults');
        const urlList = document.getElementById('urlList');
        const resultCount = document.getElementById('resultCount');

        if (!resultsDiv || !urlList || !resultCount) {
            console.error('Result display elements not found');
            return;
        }

        // Clear previous results
        urlList.innerHTML = '';

        // Update count
        resultCount.textContent = `${urls.length} URLs found`;

        // Create URL items
        urls.forEach((url, index) => {
            const urlItem = document.createElement('div');
            urlItem.className = 'url-item';
            
            urlItem.innerHTML = `
                <div class="url-text" title="${url}">${url}</div>
                <div class="url-actions">
                    <button class="btn btn-sm btn-outline" onclick="window.extractor.copySingleUrl('${url}')" title="Copy URL">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="window.open('${url}', '_blank')" title="Open URL">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            `;
            
            urlList.appendChild(urlItem);
        });

        // Show results
        resultsDiv.classList.remove('hidden');
    }

    // Copy single URL
    async copySingleUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            window.app.showToast('URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            window.app.showToast('Failed to copy URL', 'error');
        }
    }

    // Handle text extraction
    async handleTextExtraction() {
        const textArea = document.getElementById('urlText');
        const text = textArea?.value;

        if (!text || !text.trim()) {
            window.app.showToast('Please enter some text containing URLs', 'warning');
            return;
        }

        try {
            // Show loading state
            window.app.showLoading('Extracting URLs...');

            // Extract URLs
            const urls = this.extractFromText(text);

            if (urls.length === 0) {
                window.app.showToast('No URLs found in the text', 'warning');
                return;
            }

            // Check limit
            if (!this.canExtract(urls.length)) {
                const maxUrls = this.getMaxUrls();
                window.app.showToast(`Found ${urls.length} URLs but your plan limits to ${maxUrls} URLs. Upgrade to Premium for higher limits.`, 'warning');
                return;
            }

            // Display results
            this.displayResults(urls);

            // Save extraction if user is authenticated
            if (this.auth.isAuthenticated()) {
                await this.saveExtraction(text, urls, 'text');
                window.app.showToast(`Extracted ${urls.length} URLs and saved to history`, 'success');
            } else {
                window.app.showToast(`Extracted ${urls.length} URLs. Sign in to save to history.`, 'success');
            }

        } catch (error) {
            console.error('Text extraction error:', error);
            window.app.showToast(error.message || 'Failed to extract URLs', 'error');
        } finally {
            window.app.hideLoading();
        }
    }

    // Handle webpage extraction
    async handleWebpageExtraction() {
        const urlInput = document.getElementById('webpageUrl');
        const webpageUrl = urlInput?.value;

        if (!webpageUrl) {
            window.app.showToast('Please enter a webpage URL', 'warning');
            return;
        }

        try {
            // Show loading state
            window.app.showLoading('Extracting URLs from webpage...');

            // Extract URLs
            const urls = await this.extractFromWebpage(webpageUrl);

            if (urls.length === 0) {
                window.app.showToast('No URLs found on the webpage', 'warning');
                return;
            }

            // Check limit
            if (!this.canExtract(urls.length)) {
                const maxUrls = this.getMaxUrls();
                window.app.showToast(`Found ${urls.length} URLs but your plan limits to ${maxUrls} URLs. Upgrade to Premium for higher limits.`, 'warning');
                return;
            }

            // Display results
            this.displayResults(urls);

            // Save extraction if user is authenticated
            if (this.auth.isAuthenticated()) {
                await this.saveExtraction(webpageUrl, urls, 'webpage');
                window.app.showToast(`Extracted ${urls.length} URLs and saved to history`, 'success');
            } else {
                window.app.showToast(`Extracted ${urls.length} URLs. Sign in to save to history.`, 'success');
            }

        } catch (error) {
            console.error('Webpage extraction error:', error);
            window.app.showToast(error.message || 'Failed to extract URLs from webpage', 'error');
        } finally {
            window.app.hideLoading();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Text/Webpage tabs
        const textTab = document.getElementById('textTab');
        const urlTab = document.getElementById('urlTab');
        const textInput = document.getElementById('textInput');
        const urlInput = document.getElementById('urlInput');

        if (textTab && urlTab && textInput && urlInput) {
            textTab.addEventListener('click', () => {
                textTab.classList.add('active');
                urlTab.classList.remove('active');
                textInput.classList.remove('hidden');
                urlInput.classList.add('hidden');
            });

            urlTab.addEventListener('click', () => {
                urlTab.classList.add('active');
                textTab.classList.remove('active');
                urlInput.classList.remove('hidden');
                textInput.classList.add('hidden');
            });
        }

        // Extraction buttons
        const extractFromTextBtn = document.getElementById('extractFromTextBtn');
        const extractFromUrlBtn = document.getElementById('extractFromUrlBtn');

        if (extractFromTextBtn) {
            extractFromTextBtn.addEventListener('click', () => {
                this.handleTextExtraction();
            });
        }

        if (extractFromUrlBtn) {
            extractFromUrlBtn.addEventListener('click', () => {
                this.handleWebpageExtraction();
            });
        }

        // Clear buttons
        const clearTextBtn = document.getElementById('clearTextBtn');
        const clearUrlBtn = document.getElementById('clearUrlBtn');

        if (clearTextBtn) {
            clearTextBtn.addEventListener('click', () => {
                document.getElementById('urlText').value = '';
                document.getElementById('extractResults').classList.add('hidden');
            });
        }

        if (clearUrlBtn) {
            clearUrlBtn.addEventListener('click', () => {
                document.getElementById('webpageUrl').value = '';
                document.getElementById('extractResults').classList.add('hidden');
            });
        }

        // Download and copy buttons
        const downloadBtn = document.getElementById('downloadBtn');
        const copyBtn = document.getElementById('copyBtn');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const urls = Array.from(document.querySelectorAll('.url-text')).map(el => el.textContent);
                if (urls.length > 0) {
                    const format = this.auth.isPremium() ? 'json' : 'txt';
                    this.exportUrls(urls, format);
                    window.app.showToast(`Exported ${urls.length} URLs as ${format.toUpperCase()}`, 'success');
                }
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const urls = Array.from(document.querySelectorAll('.url-text')).map(el => el.textContent);
                if (urls.length > 0) {
                    try {
                        await this.copyUrlsToClipboard(urls);
                        window.app.showToast(`Copied ${urls.length} URLs to clipboard`, 'success');
                    } catch (error) {
                        window.app.showToast('Failed to copy URLs', 'error');
                    }
                }
            });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLExtractor;
}