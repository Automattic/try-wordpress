import { createApp } from '@/ui/App';
import { Container, createRoot } from 'react-dom/client';
import { initParser } from '@/parser/init';
import '@wordpress/components/build-style/style.css';
import './app.css';

initParser();

const root = createRoot( document.getElementById( 'app' ) as Container );
root.render( await createApp() );
