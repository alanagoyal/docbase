import { StylesConfig } from 'react-select';

export const selectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    height: 'auto',
    minHeight: '40px',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    borderColor: 'hsl(var(--input))',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'hsl(var(--input))',
    },
    padding: '0',
    ...(state.isFocused && {
      outline: 'none',
      boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring))',
      borderColor: 'hsl(var(--ring))',
    }),
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 12px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected || state.isFocused
      ? 'hsl(var(--muted))'
      : provided.backgroundColor,
    color: 'hsl(var(--foreground))',
    '&:active': {
      backgroundColor: 'hsl(var(--muted))',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    margin: 0,
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    padding: 0,
    color: 'inherit',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    display: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, // Increased z-index
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--input))',
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '200px',
  }),
};