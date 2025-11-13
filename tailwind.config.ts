import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			'xs': '475px',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Stripe-inspired extended colors
  			stripe: {
  				purple: '#635bff',
  				'purple-dark': '#0a2540',
  				cyan: '#00d4ff',
  				teal: '#00c48c',
  				blue: {
  					50: '#f0f7ff',
  					100: '#e0efff',
  					200: '#b8dcff',
  					300: '#7ac0ff',
  					400: '#36a3ff',
  					500: '#0a84ff',
  					600: '#0066cc',
  					700: '#004c99',
  					800: '#003366',
  					900: '#001933',
  				}
  			},
  			gray: {
  				950: '#0a0a0a',
  				900: '#1a1a1a',
  				850: '#2a2a2a',
  				800: '#3f4b66',
  				700: '#727f96',
  				600: '#8a94a6',
  				500: '#b2bcc7',
  				400: '#d1d5db',
  				300: '#e5e7eb',
  				200: '#f3f4f6',
  				100: '#f9fafb',
  				50: '#fafbfc',
  			}
  		},
  		borderRadius: {
  			'2xl': '32px',
  			'xl': '24px',
  			'lg': '16px',
  			'md': '12px',
  			'DEFAULT': '8px',
  			'sm': '6px',
  		},
  		fontSize: {
  			'display': ['64px', { lineHeight: '72px', fontWeight: '600' }],
  			'h1': ['48px', { lineHeight: '56px', fontWeight: '600' }],
  			'h2': ['36px', { lineHeight: '44px', fontWeight: '600' }],
  			'h3': ['30px', { lineHeight: '38px', fontWeight: '600' }],
  			'h4': ['24px', { lineHeight: '32px', fontWeight: '600' }],
  			'h5': ['20px', { lineHeight: '28px', fontWeight: '600' }],
  			'h6': ['18px', { lineHeight: '28px', fontWeight: '600' }],
  			'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
  			'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  			'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  			'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
  		},
  		spacing: {
  			'xs': '4px',
  			'sm': '8px',
  			'md': '16px',
  			'lg': '24px',
  			'xl': '32px',
  			'2xl': '48px',
  			'3xl': '64px',
  			'4xl': '96px',
  			'5xl': '128px',
  			'6xl': '160px',
  		},
  		boxShadow: {
  			'stripe-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
  			'stripe-md': '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)',
  			'stripe-lg': '0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)',
  			'stripe-xl': '0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.08)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
