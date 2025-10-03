// Minimal config helper for popup UI. Exposes theme values if other scripts want them.
window.GS_CONFIG = {
  theme: {
    accent: '#00c2ff',
    accent2: '#7cf1ff',
    bg: '#071019'
  },
  defaults: {
    themeMode: 'dark' // 'dark' or 'light'
  },
  applyThemeMode(mode){
    const root = document.documentElement;
    // Add a short 'theme-fade' class to hint transitions (CSS should define transitions on body/.wrap)
    try{
      root.classList.add('theme-fade');
      // apply theme class
      if(mode === 'light'){
        root.classList.remove('gs-dark');
        root.classList.add('gs-light');
      } else {
        root.classList.remove('gs-light');
        root.classList.add('gs-dark');
      }
      // remove fade marker after a short delay
      window.setTimeout(() => {
        root.classList.remove('theme-fade');
      }, 300);
    }catch(e){
      // best-effort
      if(mode === 'light'){
        root.classList.remove('gs-dark');
        root.classList.add('gs-light');
      } else {
        root.classList.remove('gs-light');
        root.classList.add('gs-dark');
      }
    }
  }
};
