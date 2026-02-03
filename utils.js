/**
 * Component Loader Utility
 * Loads HTML components dynamically into the page
 */

/**
 * Load a component from file and insert into target element
 * @param {string} componentPath - Path to component HTML file
 * @param {string} targetId - ID of target element to insert component
 */
async function loadComponent(componentPath, targetId) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.innerHTML += html;
        } else {
            // If no target, append to body
            document.body.insertAdjacentHTML('beforeend', html);
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Load multiple components
 * @param {Array<{path: string, target?: string}>} components - Array of component configs
 */
async function loadComponents(components) {
    const promises = components.map(({ path, target }) => 
        loadComponent(path, target || 'app')
    );
    await Promise.all(promises);
}

/**
 * Initialize all components on page load
 */
async function initializeComponents() {
    await loadComponents([
        { path: 'components/toast.html' },
        { path: 'components/edit-my-info-modal.html' },
        { path: 'components/change-password-modal.html' },
        { path: 'components/edit-user-modal.html' }
    ]);
    
    console.log('✅ All components loaded successfully');
}

// Auto-load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}
