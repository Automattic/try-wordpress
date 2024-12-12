import { createApp } from '@/ui/App';
import { Container, createRoot } from 'react-dom/client';
import { initParser } from '@/parser/init';
import '@wordpress/components/build-style/style.css';
import './app.css';
import { getSchema } from '@/model/subject/Schema';
import { SubjectType } from '@/model/subject/Subject';

initParser();

// TODO: This is only here so that webpack embeds the schema.json into the js bundle.
// TODO: Once we call the getSchema() function from elsewhere, this call should be removed.
getSchema( SubjectType.BlogPost );

const root = createRoot( document.getElementById( 'app' ) as Container );
root.render( await createApp() );
