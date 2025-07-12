// public/theme.js
(function() {
  try {
    // Get theme preference with fallbacks
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Define dashboard paths - keep in sync with ThemeProvider list
    const dashboardPaths = [
      '/dashboard', 
      '/forms', 
      '/preview', 
      '/deploy', 
      '/settings', 
      '/profile', 
      '/support',
      '/submissions'
    ];
    
    // Check if current path is a dashboard path
    const path = window.location.pathname;
    const isDashboardPath = dashboardPaths.some(route => path.startsWith(route));
    
    // Only apply theme to dashboard paths
    if (isDashboardPath) {
      let themeToApply = 'light';
      
      // Determine theme to apply
      if (storedTheme === 'dark') {
        themeToApply = 'dark';
      } else if (storedTheme === 'system' || !storedTheme) {
        themeToApply = prefersDark ? 'dark' : 'light';
      }
      
      // Apply theme class
      document.documentElement.classList.add(themeToApply);
      
      // Store resolved theme for hydration matching
      document.documentElement.setAttribute('data-theme', themeToApply);
    } else {
      // Frontend pages always use light theme
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    // Fallback if localStorage is unavailable
    console.error('Theme initialization error:', e);
  }
})();