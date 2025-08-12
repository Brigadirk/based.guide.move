# ⚠️ DEPRECATED: Legacy Streamlit Application

This directory contains the **original Streamlit implementation** of BasedGuide. 

## 🚫 **THIS APP IS DEPRECATED**

**Do not use this application for production or new development.**

## 📋 Purpose of This Directory

This legacy code serves **ONLY** as a reference for the Next.js development team:

### ✅ **Valid Use Cases**
- **Feature Reference**: Understanding original business logic and form flows
- **Validation**: Comparing outputs when debugging the Next.js app
- **Documentation**: Understanding complex conditional logic and data structures
- **AI Context**: Reference for story generation and prompt engineering

### ❌ **Invalid Use Cases**
- **Production Deployment**: Never deploy this app for users
- **New Features**: All new development goes in `base_recommender_next_js/`
- **Bug Fixes**: Fix issues in the Next.js app, not here
- **User Testing**: Direct users to the Next.js application

## 🔄 Migration Status

The Next.js application (`base_recommender_next_js/`) now includes:

✅ **Complete Feature Parity**: All Streamlit functionality migrated  
✅ **Enhanced UX**: Modern interface with better user experience  
✅ **EU Integration**: Advanced EU citizenship and visa analysis  
✅ **Family Support**: Complex family visa coordination  
✅ **AI Enhancement**: Improved context generation for AI analysis  
✅ **Performance**: Faster, more responsive user interface  

## 🗂 File Structure Reference

```
base_recommender/
├── st_app.py                    # Main Streamlit application
├── app_components/              # Form sections and utilities
│   ├── personal.py             # Personal information forms
│   ├── education.py            # Education and skills
│   ├── finance.py              # Financial information
│   ├── destination.py          # Destination planning
│   ├── residency_intentions.py # Residency and visa planning
│   └── state/                  # State management
└── temp_profiles/              # Example user profiles
```

## 📖 Key Differences from Next.js App

| Aspect | Streamlit (Deprecated) | Next.js (Current) |
|--------|----------------------|-------------------|
| **Interface** | Simple form-based | Modern React components |
| **State** | Session-based | Zustand persistence |
| **Validation** | Basic Python validation | Zod + TypeScript |
| **EU Support** | Limited | Comprehensive EU analysis |
| **Family Visas** | Basic handling | Advanced coordination |
| **AI Context** | Simple concatenation | Sophisticated narratives |
| **Performance** | Server-side rendering | Client-side optimization |

## 🔧 Running (For Reference Only)

If you need to run this for comparison purposes:

```bash
cd base_recommender
pip install -r requirements.txt
streamlit run st_app.py
```

**⚠️ Remember: This is for development reference only!**

## 🎯 When to Consult This Code

### **During Next.js Development**
- **Complex Logic**: Understanding intricate conditional form logic
- **Data Structures**: Seeing how data was originally structured
- **AI Integration**: Reference for story generation patterns
- **Edge Cases**: Finding business rules that might be missed

### **During Debugging**
- **Output Comparison**: Comparing story generation between implementations
- **Logic Validation**: Ensuring Next.js matches original business logic
- **Feature Gaps**: Identifying missing functionality in Next.js

### **Never**
- **User Demos**: Always use the Next.js application
- **Production**: This code should never be deployed
- **New Features**: All development happens in Next.js
- **Performance Testing**: This app is not optimized

---

**For current development, always use the Next.js application in `base_recommender_next_js/`**
