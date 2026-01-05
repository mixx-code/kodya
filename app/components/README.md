# Alert Component Documentation

## Overview

The Alert component is a reusable modal dialog system that provides consistent user feedback throughout the application. It supports different types of alerts (success, error, warning, info) and can be used for both simple notifications and confirmation dialogs.

## Files

- `Alert.tsx` - The main Alert component
- `useAlert.ts` - Custom hook for managing alert state
- `AlertExample.tsx` - Example implementation

## Usage

### 1. Import the hook and component

```tsx
import Alert from "@/app/components/Alert";
import { useAlert } from "@/hooks/useAlert";
```

### 2. Use the hook in your component

```tsx
function MyComponent() {
  const { alert, showAlert, showConfirm, hideAlert } = useAlert();

  // Show simple alert
  const handleSuccess = () => {
    showAlert('success', 'Success!', 'Operation completed successfully.');
  };

  // Show confirmation dialog
  const handleDelete = async () => {
    const confirmed = await showConfirm(
      'Confirm Delete',
      'Are you sure you want to delete this item?'
    );
    
    if (confirmed) {
      // Perform delete operation
      showAlert('success', 'Deleted', 'Item has been deleted.');
    }
  };

  return (
    <div>
      {/* Your component content */}
      
      {/* Alert component */}
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isConfirm={alert.isConfirm}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={hideAlert}
      />
    </div>
  );
}
```

## API Reference

### useAlert Hook

Returns an object with:

- `alert` - Current alert state object
- `showAlert(type, title, message)` - Show a simple alert
- `showConfirm(title, message)` - Show a confirmation dialog (returns Promise<boolean>)
- `hideAlert()` - Hide the current alert

### Alert Component Props

| Prop | Type | Description |
|------|------|-------------|
| `show` | boolean | Whether the alert is visible |
| `type` | 'success' \| 'error' \| 'warning' \| 'info' | Alert type |
| `title` | string | Alert title |
| `message` | string | Alert message |
| `isConfirm` | boolean (optional) | Whether this is a confirmation dialog |
| `onConfirm` | function (optional) | Called when confirm button is clicked |
| `onCancel` | function (optional) | Called when cancel button is clicked |
| `onClose` | function | Called when close button or OK button is clicked |

## Alert Types

- **success**: Green color with checkmark icon
- **error**: Red color with error icon
- **warning**: Yellow color with warning icon
- **info**: Blue color with info icon

## Styling

The component uses CSS custom properties for theming:

- `var(--success)` - Success color
- `var(--error)` - Error color
- `var(--warning)` - Warning color
- `var(--info)` - Info color
- `var(--card-background)` - Modal background
- `var(--text-primary)` - Primary text color
- `var(--text-secondary)` - Secondary text color
- `var(--text-inverse)` - Inverted text color
- `var(--text-muted)` - Muted text color
- `var(--border-primary)` - Primary border color
- `var(--accent)` - Accent color

## Examples

See `AlertExample.tsx` for complete usage examples.
