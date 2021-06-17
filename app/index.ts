// Model should have 0 dependecies to the project
import './model';

import './utils';

// Services should only depend on the model
import './service';

// App dependes on the model and services
import './app.ts';

// Components are a part of the app
import './component';

// Same with directives
import './directive';

