(function(){
  const WEBSITE_URL="https://tryformix.vercel.app";
  const LOG_PREFIX='[SheetsForm]';
  let DEBUG_MODE=false;
  const SCHEMA_VERSION = '1.0'; 

  const log=(...args)=>DEBUG_MODE&&console.log(`${LOG_PREFIX}`,...args);
  const error=(...args)=>DEBUG_MODE&&console.error(`${LOG_PREFIX}`,...args);
  const formId=document.currentScript?.dataset.formId;
  const config=(window.SheetsFormConfig?.[formId]||{});
  config.formId=formId;
  const containerId=`sheetsform-${formId}`;
  let lastSubmissionTime=0;
  const SUBMISSION_INTERVAL=5000;

  // Update the getStyleConfig to use custom colors if available
  const getStyleConfig = () => {
    const getCSSVar = (name, fallback) => {
      try {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      } catch(e) {
        return fallback;
      }
    };
    
    // Get custom colors from config if available
    const customColors = window.SheetsFormConfig?.[formId]?.colors || {};
    
    return {
      primary: customColors.primary || getCSSVar('--sf-primary', '#34A853'),
      secondary: customColors.secondary || getCSSVar('--sf-secondary', '#0F9D58'),
      border: customColors.border || getCSSVar('--sf-border', '#dadce0'),
      background: customColors.background || getCSSVar('--sf-background', '#ffffff'),
      cardBg: customColors.cardBackground || getCSSVar('--sf-card-bg', '#f8faf8'),
      text: customColors.text || getCSSVar('--sf-text', '#202124'),
      lightText: customColors.lightText || getCSSVar('--sf-light-text', '#5f6368'),
      inputBackground: customColors.inputBackground || getCSSVar('--sf-input-bg', '#fcfcfc'),
      inputText: customColors.inputText || getCSSVar('--sf-input-text', '#202124'),
      buttonHover: customColors.buttonHover || getCSSVar('--sf-button-hover', '#15803d'),
      inputBorderFocus: customColors.inputBorderFocus || getCSSVar('--sf-input-focus', '#86efac'),
      placeholderText: customColors.placeholderText || getCSSVar('--sf-placeholder', '#9ca3af'),
      font: customColors.font || getCSSVar('--sf-font', 'Inter, system-ui, sans-serif'),
      borderRadius: customColors.borderRadius || getCSSVar('--sf-border-radius', '8px'),
      padding: customColors.padding || getCSSVar('--sf-padding', '12px'),
      shadow: customColors.shadow || getCSSVar('--sf-shadow', '0 4px 12px rgba(0,0,0,0.08)'),
      error: customColors.error || getCSSVar('--sf-error', '#dc2626'),
      success: customColors.success || getCSSVar('--sf-success', '#16a34a')
    };
  };

  const styles=getStyleConfig();

  const addResponsiveStyles=()=>{
    const styleId='sheetsform-responsive';
    if(document.getElementById(styleId))return;
    const styleTag=document.createElement('style');
    styleTag.id=styleId;
    styleTag.textContent=`
      .sf-form-container{
        width:100%;
        max-width:800px; 
        margin:0 auto;
        padding:1.5rem;
        box-sizing:border-box;
        background-color:${styles.background};
        border-radius:${styles.borderRadius};
        box-shadow:${styles.shadow};
        font-family:${styles.font};
        transition:all 0.3s ease;
      }
      .sf-field{
        margin-bottom:1.5rem;
        position:relative;
      }
      .sf-field label{
        display:block;
        margin-bottom:0.5rem;
        font-size:0.9rem;
        font-weight:500;
        color:${styles.text};
        transition:all 0.2s ease;
      }
      .sf-field input,.sf-field select,.sf-field textarea{
        width:100%;
        padding:0.875rem;
        border:1px solid ${styles.border};
        border-radius:${styles.borderRadius};
        font-size:1rem;
        background-color:${styles.inputBackground};
        box-sizing:border-box;
        transition:all 0.2s ease;
        color:${styles.inputText};
        font-family:${styles.font};
      }
      .sf-field input:focus,.sf-field select:focus,.sf-field textarea:focus{
        outline:none;
        border-color:${styles.primary};
        box-shadow:0 0 0 2px ${styles.inputBorderFocus}40;
      }
      .sf-field-invalid{
        border-color:${styles.error} !important;
        box-shadow:0 0 0 2px rgba(220,38,38,0.1) !important;
      }
      .sf-field-error{
        color:${styles.error};
        font-size:0.8rem;
        margin-top:0.5rem;
        display:none;
      }
      .sf-field textarea{
        min-height:120px;
        resize:vertical;
      }
      .sf-help-text{
        color:${styles.lightText};
        font-size:0.75rem;
        margin-top:0.5rem;
        font-style:italic;
      }
      .sf-checkbox-field{
        position:relative;
      }
      .sf-checkbox{
        display:flex;
        align-items:flex-start;
        cursor:pointer;
        margin-bottom:0.75rem;
      }
      .sf-checkbox input[type="checkbox"]{
        width:auto;
        margin-right:0.75rem;
        margin-top:0.25rem;
        accent-color:${styles.primary};
        min-width:1rem;
        min-height:1rem;
      }
      button[type="submit"]{
        width:100%;
        padding:0.875rem;
        font-size:1rem;
        background-color:${styles.primary};
        color:white;
        border:none;
        border-radius:${styles.borderRadius};
        cursor:pointer;
        font-weight:600;
        letter-spacing:0.01em;
        transition:all 0.2s ease;
        box-shadow:0 2px 4px rgba(0,0,0,0.1);
      }
      button[type="submit"]:hover{
        background-color:${styles.buttonHover};
        box-shadow:0 4px 8px rgba(0,0,0,0.15);
        transform:translateY(-1px);
      }
      button[type="submit"]:disabled{
        background-color:#7fbd8a;
        cursor:not-allowed;
        transform:none;
        box-shadow:none;
      }
      .sf-error,.sf-success{
        padding:1.25rem;
        margin:1rem 0;
        border-radius:${styles.borderRadius};
        animation:fadeIn 0.5s ease;
      }
      .sf-error{
        background-color:#fef2f2;
        color:#b91c1c;
        border-left:4px solid ${styles.error};
      }
      .sf-success{
        background-color:${styles.cardBg};
        color:#166534;
        border-left:4px solid ${styles.success};
      }
      .sf-submission-error{
        color:${styles.error};
        font-size:0.875rem;
        margin-top:1rem;
        padding:0.75rem;
        background-color:#fef2f2;
        border-radius:${styles.borderRadius};
        border-left:3px solid ${styles.error};
        display:none;
      }
      @keyframes fadeIn{
        from{opacity:0;transform:translateY(10px);}
        to{opacity:1;transform:translateY(0);}
      }
      @keyframes spin{
        0%{transform:rotate(0deg);}
        100%{transform:rotate(360deg);}
      }
      .sf-loading{
        text-align:center;
        padding:2rem;
        border-radius:${styles.borderRadius};
        background-color:#fcfcfc;
        border:1px solid ${styles.border};
        box-shadow:${styles.shadow};
      }
      .sf-loading-spinner{
        margin:0 auto 1.25rem;
        width:40px;
        height:40px;
        border:3px solid rgba(52,168,83,0.2);
        border-top:3px solid ${styles.primary};
        border-radius:50%;
        animation:spin 1s linear infinite;
      }
      .sf-checkbox-question,.sf-radio-question{
        font-weight:600;
        font-size:0.95rem;
        margin-bottom:0.875rem;
        color:${styles.text};
      }
      .sf-checkbox-group,.sf-radio-group{
        display:flex;
        flex-direction:column;
        gap:0.75rem;
        padding-left:0.5rem;
        margin-bottom:0.5rem;
      }
      .sf-checkbox-label,.sf-radio-label{
        font-size:0.9rem;
        line-height:1.4;
      }
      .sf-field-checkbox-container,.sf-field-radio-container{
        background-color:${styles.cardBackground};
        padding:1rem;
        border-radius:${styles.borderRadius};
        border:1px solid ${styles.border};
      }
      .sf-radio{
        display:flex;
        align-items:flex-start;
        cursor:pointer;
        margin-bottom:0.75rem;
      }
      .sf-radio input[type="radio"]{
        width:auto;
        margin-right:0.75rem;
        margin-top:0.25rem;
        accent-color:${styles.primary};
        min-width:1rem;
        min-height:1rem;
      }
      .sf-checkbox-error,.sf-radio-error{
        color:${styles.error};
        font-size:0.8rem;
        margin-top:0.5rem;
        padding:0.5rem;
        background-color:rgba(220,38,38,0.05);
        border-radius:4px;
      }
      .sf-clear-saved{
        margin-top:0.5rem;
        background:none;
        border:none;
        color:${styles.lightText};
        font-size:0.8rem;
        text-decoration:underline;
        cursor:pointer;
        padding:0.25rem 0.5rem;
        border-radius:4px;
      }
      .sf-clear-saved:hover{
        color:${styles.text};
        background-color:rgba(0,0,0,0.05);
      }
      @media(max-width:480px){
        .sf-form-container{
          padding:1rem;
          box-shadow:0 2px 8px rgba(0,0,0,0.06);
        }
        .sf-field{
          margin-bottom:1.25rem;
        }
        .sf-field input,.sf-field select,.sf-field textarea{
          padding:0.75rem;
          font-size:0.9375rem;
        }
        button[type="submit"]{
          padding:0.75rem;
          font-size:0.9375rem;
        }
        .sf-error,.sf-success{
          padding:1rem;
          margin:0.75rem 0;
        }
      }
      
      .sf-form-grid { 
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1rem;
        width: 100%;
      }
      
      .sf-col-span-1, .sf-col-span-2, .sf-col-span-3 { 
        grid-column: span 12; 
      }
      
      @media(min-width: 768px) {
        .sf-col-span-1 { grid-column: span 12; }
        .sf-col-span-2 { grid-column: span 6; }
        .sf-col-span-3 { grid-column: span 4; }
      }
      
      .sf-cta-button {
        width: 100%;
        padding: 0.875rem;
        font-size: 1rem;
        background-color: ${styles.primary};
        color: white;
        border: none;
        border-radius: ${styles.borderRadius};
        cursor: pointer;
        font-weight: 600;
        letter-spacing: 0.01em;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .sf-cta-button:hover {
        background-color: #2a8644;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
      .sf-cta-button:disabled {
        background-color: #7fbd8a;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .sf-field input::placeholder, 
      .sf-field textarea::placeholder, 
      .sf-field select::placeholder {
        color: ${styles.placeholderText};
      }
    `;
    document.head.appendChild(styleTag);
  };

  const templates={
    loading:()=>`
      <div class="sf-loading">
        <div class="sf-loading-spinner"></div>
        <p style="color:${styles.text};font-weight:500;">Loading form...</p>
      </div>
    `,
    error:(message)=>`
      <div class="sf-error">
        <div style="display:flex;align-items:center;margin-bottom:0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="${styles.error}" style="width:24px;height:24px;margin-right:0.75rem;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
          <h3 style="color:${styles.error};margin:0;font-weight:600;">Unable to load form</h3>
        </div>
        <p style="color:${styles.text};margin:0;">${message}</p>
      </div>
    `,
    success:(message)=>`
      <div class="sf-success">
        <div style="display:flex;align-items:center;margin-bottom:0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="${styles.success}" style="width:24px;height:24px;margin-right:0.75rem;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 style="color:${styles.success};margin:0;font-weight:600;">Thank you!</h3>
        </div>
        <p style="color:${styles.text};margin:0;">${message||"Your form has been submitted successfully."}</p>
      </div>
    `
  };

  const showError=(container,message)=>container&&(container.innerHTML=templates.error(message));
  const getContainer=()=>document.getElementById(containerId);

  function validateField(field) {
    let isValid = true;
    let message = '';
    
    // Basic required validation
    if (field.required && !field.value.trim()) {
      isValid = false;
      message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailPattern.test(field.value);
      if (!isValid) message = 'Please enter a valid email address';
    }
    
    // Improved phone validation - supports international formats
    if (field.type === 'tel' && field.value) {
      // More flexible pattern: allows international formats with country codes
      // Accepts: +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890, etc.
      const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
      isValid = phonePattern.test(field.value);
      if (!isValid) message = 'Please enter a valid phone number';
    }
    
    // Number validation
    if (field.type === 'number' && field.value) {
      isValid = !isNaN(parseFloat(field.value)) && isFinite(field.value);
      if (!isValid) message = 'Please enter a valid number';
    }
    
    // Show or hide error message
    const errorElement = field.parentNode.querySelector('.sf-field-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = isValid ? 'none' : 'block';
    }
    
    // Add or remove validation styling
    field.classList.toggle('sf-invalid', !isValid);
    field.setAttribute('aria-invalid', !isValid);
    
    return isValid;
  }

  function setupRealTimeValidation(form){
    const inputs=form.querySelectorAll('input,textarea,select');
    inputs.forEach(input=>{
      input.addEventListener('blur',()=>validateField(input));
      input.addEventListener('input',()=>{
        const errorMsg=input.parentNode.querySelector('.sf-field-error');
        if(errorMsg)errorMsg.style.display='none';
        input.classList.remove('sf-field-invalid');
      });
    });
  }

  function addCSRFProtection(form) {
    // Generate more secure token with higher entropy
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    
    // Store token in sessionStorage with expiration timestamp
    const expires = Date.now() + 3600000; // 1 hour expiration
    sessionStorage.setItem('sf_csrf_token', JSON.stringify({ value: token, expires }));
    
    // Add token to form
    const tokenField = document.createElement('input');
    tokenField.type = 'hidden';
    tokenField.name = 'csrf_token';
    tokenField.value = token;
    form.appendChild(tokenField);
    
    // Add an additional submission timestamp to prevent replay attacks
    const timestampField = document.createElement('input');
    timestampField.type = 'hidden';
    timestampField.name = 'submission_time';
    timestampField.value = Date.now();
    form.appendChild(timestampField);
  }

  function checkRateLimit(){
    const now=Date.now();
    if(now-lastSubmissionTime<SUBMISSION_INTERVAL){
      return false;
    }
    lastSubmissionTime=now;
    return true;
  }

  function setupAutosave(form) {
    if (!formId) return;
    
    const storageKey = `sf_draft_${formId}`;
    const inputs = form.querySelectorAll('input,textarea,select');
    
    // Create autosave notification element
    const autosaveIndicator = document.createElement('div');
    autosaveIndicator.className = 'sf-autosave-indicator';
    autosaveIndicator.style.cssText = 'opacity:0;transition:opacity 0.3s;position:fixed;bottom:1rem;right:1rem;background-color:#f0f9ff;color:#0369a1;padding:0.5rem 0.75rem;border-radius:0.25rem;font-size:0.875rem;z-index:50;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #bae6fd;';
    document.body.appendChild(autosaveIndicator);
    
    // Show saving indicator with message
    const showSavingIndicator = (message) => {
      autosaveIndicator.textContent = message;
      autosaveIndicator.style.opacity = '1';
      setTimeout(() => {
        autosaveIndicator.style.opacity = '0';
      }, 2000);
    };
    
    // Try to load saved data
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([name, value]) => {
          const field = form.querySelector(`[name="${name}"]`);
          if (field && field.type !== 'hidden') field.value = value;
        });
        showSavingIndicator('Loaded saved draft');
      } catch(e) {
        showSavingIndicator('Failed to load saved form data');
        console.error('Failed to load saved form data', e);
      }
    }
    
    // Setup save on change
    let saveTimeout;
    inputs.forEach(input => {
      if (input.type === 'hidden') return;
      input.addEventListener('change', () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        
        saveTimeout = setTimeout(() => {
          const formData = new FormData(form);
          const data = {};
          for (let [key, value] of formData.entries()) {
            if (key !== 'csrf_token') data[key] = value;
          }
          localStorage.setItem(storageKey, JSON.stringify(data));
          showSavingIndicator('Draft saved');
        }, 500);
      });
    });
    
    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'sf-clear-saved';
    clearBtn.textContent = 'Clear saved data';
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem(storageKey);
      form.reset();
      clearBtn.style.display = 'none';
      showSavingIndicator('Draft cleared');
    });
    
    if (savedData) {
      form.parentNode.insertBefore(clearBtn, form.nextSibling);
      clearBtn.style.display = 'block';
    }
  }

  async function fetchWithRetry(url,options={},retries=2,backoff=300){
    try{
      const response=await fetch(url,options);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return response;
    }catch(err){
      if(retries<=0)throw err;
      await new Promise(resolve=>setTimeout(resolve,backoff));
      return fetchWithRetry(url,options,retries-1,backoff*2);
    }
  }

  async function fetchFormConfig(){
    if(!config.formId)throw new Error('Form configuration error');
    const response=await fetchWithRetry(`${WEBSITE_URL}/api/forms/emb-form/${formId}`);
    const formData=await response.json();
    
    if (window.DEBUG_MODE) {
      console.log("Raw form data received: ", formData);
    }
    
    try {
      if(formData && formData.fields && formData.fields.length > 0) {
        localStorage.setItem(`sf_form_structure_${formId}`, JSON.stringify({
          version: SCHEMA_VERSION,
          data: formData
        }));
      }
    } catch(e) {
      error('Failed to cache form structure', e);
    }
    
    formData.fields = formData.fields?.map(field => {
      const processedField = {...field};

      if(processedField.type === 'checkbox') {
        processedField.checkboxOptions = processedField.checkboxOptions || [];
        processedField.checkboxLabel = processedField.checkboxLabel || processedField.label;
      }
      
      if(processedField.type === 'radio') {
        processedField.radioOptions = processedField.radioOptions || field.options || [];
        processedField.radioLabel = processedField.radioLabel || processedField.label;
      }
      
      if(processedField.type === 'cta') {
        if(!processedField.ctaText) {
          processedField.ctaText = processedField.label || 'Submit';
        }
      }
      
      return processedField;
    }) || [];
    
    return formData;
  }

  function sanitizeInput(value) {
    if (!value) return value;
    return String(value)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderFieldInput(field) {
    // For checkbox groups
    if (field.type === 'checkbox') {
      return `
        <div class="sf-checkbox-group" ${field.required ? 'data-required="true"' : ''} role="group" aria-labelledby="${field.id}-label">
          <div id="${field.id}-label" class="sf-checkbox-label">${field.label}${field.required ? ' <span style="color:#ef4444;">*</span>' : ''}</div>
          ${(field.checkboxOptions || field.options || []).map((option, i) => `
            <div class="sf-checkbox">
              <input 
                type="checkbox" 
                id="${field.id}_${i}" 
                name="${field.label}" 
                value="${option}"
                ${field.required ? 'required' : ''}
                aria-describedby="${field.id}-help"
              >
              <label for="${field.id}_${i}">${option}</label>
            </div>
          `).join('')}
          ${field.helpText ? `<div id="${field.id}-help" class="sf-help-text">${field.helpText}</div>` : ''}
          <div class="sf-checkbox-error sf-field-error" style="display:none;" role="alert">Please select at least one option</div>
        </div>
      `;
    }
    
    // For radio groups
    if (field.type === 'radio') {
      return `
        <div class="sf-radio-group" ${field.required ? 'data-required="true"' : ''} role="radiogroup" aria-labelledby="${field.id}-label">
          <div id="${field.id}-label" class="sf-radio-label">${field.label}${field.required ? ' <span style="color:#ef4444;">*</span>' : ''}</div>
          ${(field.radioOptions || field.options || []).map((option, i) => `
            <div class="sf-radio">
              <input 
                type="radio" 
                id="${field.id}_${i}" 
                name="${field.label}" 
                value="${option}"
                ${field.required ? 'required' : ''}
                aria-describedby="${field.id}-help"
              >
              <label for="${field.id}_${i}">${option}</label>
            </div>
          `).join('')}
          ${field.helpText ? `<div id="${field.id}-help" class="sf-help-text">${field.helpText}</div>` : ''}
          <div class="sf-radio-error sf-field-error" style="display:none;" role="alert">Please select one option</div>
        </div>
      `;
    }
    
    // For text, email, number, etc.
    const commonAttributes = `
      id="${field.id}" 
      name="${field.label}" 
      placeholder="${field.placeholder || ''}" 
      ${field.required ? 'required aria-required="true"' : ''}
      aria-describedby="${field.id}-error ${field.id}-help"
      ${field.type === 'number' ? 'inputmode="numeric"' : ''}
      ${field.type === 'tel' ? 'inputmode="tel"' : ''}
    `;
  
    // Update other input types with accessibility attributes
    if (field.type === 'textarea') {
      return `
        <textarea 
          ${commonAttributes}
          rows="4"
        ></textarea>
        ${field.helpText ? `<div id="${field.id}-help" class="sf-help-text">${field.helpText}</div>` : ''}
        <div id="${field.id}-error" class="sf-field-error" style="display:none;" role="alert"></div>
      `;
    }
    
    // For select dropdown
    if (field.type === 'select') {
      return `
        <select 
          ${commonAttributes}
        >
          <option value="" disabled ${!field.value ? 'selected' : ''}>Please select...</option>
          ${(field.options || []).map(option => `<option value="${option}" ${field.value === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
        ${field.helpText ? `<div id="${field.id}-help" class="sf-help-text">${field.helpText}</div>` : ''}
        <div id="${field.id}-error" class="sf-field-error" style="display:none;" role="alert"></div>
      `;
    }
    
    // Default for text, email, number, etc.
    return `
      <input 
        type="${field.type}" 
        ${commonAttributes}
        value="${field.value || ''}"
      >
      ${field.helpText ? `<div id="${field.id}-help" class="sf-help-text">${field.helpText}</div>` : ''}
      <div id="${field.id}-error" class="sf-field-error" style="display:none;" role="alert"></div>
    `;
  }

  function renderForm(container, formConfig) {
    try {
      // Get fresh style configuration with the latest colors
      const styles = getStyleConfig();
      
      addResponsiveStyles();
      
      const fieldsHTML = formConfig.fields.map(field => {
        // Ensure columnSpan is always a number between 1-3
        const columnSpan = typeof field.columnSpan === 'number' ? 
          Math.min(Math.max(field.columnSpan, 1), 3) : 
          field.columnSpan ? parseInt(field.columnSpan) : 1;
        
        if (window.DEBUG_MODE) {
          console.log(`Field ${field.label} has columnSpan: ${field.columnSpan}`);
        }
        
        const colSpanClass = `sf-col-span-${columnSpan}`;
        
        if(field.type === 'cta') {
          return `<div class="sf-field ${colSpanClass}">${renderFieldInput(field)}</div>`;
        }
        
        return `<div class="sf-field ${field.type==='checkbox'?'sf-field-checkbox-container':''} ${field.type==='radio'?'sf-field-radio-container':''} ${colSpanClass}">
          ${(field.type!=='checkbox'&&field.type!=='radio')?`<label>${field.label}${field.required?' <span style="color:#ef4444;">*</span>':''}</label>`:''}
          ${renderFieldInput(field)}
          ${field.helpText?`<div class="sf-help-text">${field.helpText}</div>`:''}
        </div>`;
      }).join('');
      
      const hasCTAField = formConfig.fields.some(field => field.type === 'cta');
      
      container.innerHTML = `
        <div class="sf-form-container">
          <form class="sf-form">
            <div class="sf-form-grid">
              ${fieldsHTML}
              ${!hasCTAField ? `<div class="sf-field sf-col-span-1"><button type="submit">${formConfig.submitButtonText || 'Submit'}</button></div>` : ''}
            </div>
            <div class="sf-submission-error" role="alert"></div>
          </form>
        </div>
      `;
      
      const form = container.querySelector('form');
      if(form) {
        form.addEventListener('submit', handleSubmit);
        setupRealTimeValidation(form);
        addCSRFProtection(form);
        setupAutosave(form);
      }
    } catch(err) {
      showError(container, err.message || 'Unable to render form');
    }
  }

  async function handleSubmit(e){
    e.preventDefault();
    const form=e.target;
    const submitBtn=form.querySelector('button[type="submit"]');
    const originalBtnText=submitBtn.innerHTML;
    const errorContainer=form.querySelector('.sf-submission-error');
    const formContainer=form.closest('.sf-form-container');

    // Validate CSRF token before submitting
    const storedTokenData = sessionStorage.getItem('sf_csrf_token');
    const csrfInput = form.querySelector('input[name="csrf_token"]');
    
    if (!storedTokenData || !csrfInput) {
      if (errorContainer) {
        errorContainer.textContent = "Security validation failed. Please refresh the page and try again.";
        errorContainer.style.display = 'block';
      }
      return;
    }
    
    // Check token expiration
    const tokenData = JSON.parse(storedTokenData);
    if (Date.now() > tokenData.expires || csrfInput.value !== tokenData.value) {
      if (errorContainer) {
        errorContainer.textContent = "Security token expired. Please refresh the page and try again.";
        errorContainer.style.display = 'block';
      }
      return;
    }

    let isValid=true;
    
    form.querySelectorAll('input,textarea,select').forEach(field=>{
      if(field.type!=='checkbox'&&field.type!=='radio'){
        isValid=validateField(field)&&isValid;
      }
    });

    form.querySelectorAll('.sf-checkbox-group[data-required="true"]').forEach(group=>{
      const checked=[...group.querySelectorAll('input[type="checkbox"]')].some(cb=>cb.checked);
      const errorMsg=group.parentNode.querySelector('.sf-checkbox-error');
      !checked?(isValid=false,errorMsg?.style.removeProperty('display')):errorMsg?.style.setProperty('display','none');
    });

    form.querySelectorAll('.sf-radio-group[data-required="true"]').forEach(group=>{
      const checked=[...group.querySelectorAll('input[type="radio"]')].some(radio=>radio.checked);
      const errorMsg=group.parentNode.querySelector('.sf-radio-error');
      !checked?(isValid=false,errorMsg?.style.removeProperty('display')):errorMsg?.style.setProperty('display','none');
    });

    if(!isValid)return;
    
    if(!checkRateLimit()){
      if(errorContainer){
        errorContainer.textContent='Please wait a few seconds before submitting again.';
        errorContainer.style.display='block';
      }
      return;
    }

    try{
      submitBtn.disabled=true;
      submitBtn.innerHTML='<span style="display:inline-flex;align-items:center;">Submitting <span style="margin-left:8px;width:16px;height:16px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></span></span>';
      
      const formData=new FormData(form);
      const sanitizedData = new FormData();
      
      for (const [key, value] of formData.entries()) {
        // Skip files, they don't need sanitization
        if (value instanceof File) {
          sanitizedData.append(key, value);
          continue;
        }
        
        // Sanitize string values
        sanitizedData.append(key, sanitizeInput(value));
      }
      
      const data=processFormData(sanitizedData);
      
      const response = await fetchWithRetry(`${WEBSITE_URL}/api/submit-to-sheets/${config.formId}`, 
        {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
      const result = await response.json();
      
      try {
        const cachedData = localStorage.getItem(`sf_form_structure_${formId}`);
        if(cachedData) {
          const cachedForm = JSON.parse(cachedData);
          if(!cachedForm.submissions) {
            cachedForm.submissions = [];
          }
          cachedForm.submissions.push({
            data: data,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem(`sf_form_structure_${formId}`, JSON.stringify(cachedForm));
        }
      } catch(e) {
        error('Failed to update cached form structure', e);
      }
      
      if(formId){
        localStorage.removeItem(`sf_draft_${formId}`);
      }
      
      formContainer.innerHTML = templates.success(config.successMessage || result.message);
    }catch(err){
      if(errorContainer){
        errorContainer.textContent=err.message||'Error submitting form. Please try again later.';
        errorContainer.style.display='block';
      }
      submitBtn.disabled=false;
      submitBtn.innerHTML=originalBtnText;
    }
  }

  function processFormData(formData){
    return[...formData.entries()].reduce((acc,[k,v])=>{
      const key=k.endsWith('[]')?k.slice(0,-2):k;
      const isArrayField=key!==k;
      if(isArrayField)acc[key]=[...(acc[key]||[]),v];
      else acc[key]=acc.hasOwnProperty(key)?Array.isArray(acc[key])?[...acc[key],v]:[acc[key],v]:v;
      return acc;
    },{});
  }

  function initialize() {
    try {
      addResponsiveStyles();
      const container = getContainer();
      if (!formId || !container) return showError(container, 'Form configuration error');
      container.innerHTML = templates.loading();
      fetchFormConfig()
        .then(formConfig => {
          const container = getContainer();
          if (formConfig?.fields?.length) {
            // Use colors from the form configuration
            if (formConfig.colors) {
              // Update the config colors with those from the server
              if (window.SheetsFormConfig && window.SheetsFormConfig[formId]) {
                window.SheetsFormConfig[formId].colors = formConfig.colors;
              }
            }
            
            // Get fresh style configuration with updated colors
            const styles = getStyleConfig();
            // Force re-rendering the styles
            document.getElementById('sheetsform-responsive')?.remove();
            addResponsiveStyles();
            // Render the form
            renderForm(container, formConfig);
          } else {
            showError(container, 'Invalid form configuration');
          }
        })
        .catch(err => {
          const container = getContainer();
          showError(container, err.message || 'Failed to load form');
        });
    } catch (err) {
      showError(getContainer(), 'Form initialization failed');
    }
  }

  (document.readyState==='complete'?initialize():document.addEventListener('DOMContentLoaded',initialize));
})();
