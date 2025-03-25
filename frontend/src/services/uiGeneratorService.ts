
import { Parameter, UIComponent } from '../lib/types';

// Generate UI components from parameters
export const generateUIFromParameters = (parameters: Parameter[]): UIComponent[] => {
  if (parameters.length === 0) {
    return [];
  }
  
  const components: UIComponent[] = [];
  
  // Create a container for all parameters
  const paramsContainer: UIComponent = {
    id: 'ui-params-container',
    type: 'container',
    label: 'Script Parameters',
    children: []
  };
  
  // Create UI components for each parameter
  parameters.forEach(param => {
    switch (param.type) {
      case 'boolean':
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'checkbox',
          label: param.name,
          value: param.default || false,
          target: param.id
        });
        break;
      case 'number':
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'slider',
          label: param.name,
          value: param.default || 0,
          target: param.id,
          config: {
            min: 0,
            max: 100,
            step: 1
          }
        });
        break;
      case 'array':
        // For array types, we'd normally create a more complex component
        // For demo, we'll use a text input
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'input',
          label: param.name,
          value: param.default ? JSON.stringify(param.default) : '',
          target: param.id
        });
        break;
      default:
        // For string and other types
        if (param.options && param.options.length > 0) {
          paramsContainer.children?.push({
            id: `ui-${param.id}`,
            type: 'select',
            label: param.name,
            value: param.default || '',
            options: param.options,
            target: param.id
          });
        } else {
          paramsContainer.children?.push({
            id: `ui-${param.id}`,
            type: 'input',
            label: param.name,
            value: param.default || '',
            target: param.id
          });
        }
        break;
    }
  });
  
  // Add execute button
  paramsContainer.children?.push({
    id: 'ui-execute-button',
    type: 'button',
    label: 'Execute Script',
    handler: 'execute'
  });
  
  components.push(paramsContainer);
  
  // If there are visualization parameters, add visualization components
  const hasDataParams = parameters.some(p => 
    p.name.includes('data') || 
    p.name.includes('output') || 
    p.name.includes('result')
  );
  
  if (hasDataParams) {
    components.push({
      id: 'ui-visualization',
      type: 'container',
      label: 'Results Visualization',
      children: [
        {
          id: 'ui-chart',
          type: 'chart',
          label: 'Data Visualization',
          target: parameters.find(p => p.name.includes('data'))?.id
        }
      ]
    });
  }
  
  return components;
};

// Generate mock UI for demo purposes
export const generateMockUI = (scriptId: string): UIComponent[] => {
  // This is just for demo - in production this would come from backend
  const hasMock = scriptId.includes('data');
  
  if (hasMock) {
    return [
      {
        id: 'ui-1',
        type: 'container',
        label: 'Data Processing Parameters',
        children: [
          {
            id: 'ui-2',
            type: 'input',
            label: 'Data Source',
            target: 'param-1',
            value: 'sample_data.csv'
          },
          {
            id: 'ui-3',
            type: 'slider',
            label: 'Number of Rows',
            target: 'param-2',
            value: 50,
            config: {
              min: 10,
              max: 1000,
              step: 10
            }
          },
          {
            id: 'ui-4',
            type: 'checkbox',
            label: 'Include Headers',
            target: 'param-3',
            value: true
          },
          {
            id: 'ui-5',
            type: 'select',
            label: 'Output Format',
            target: 'param-4',
            value: 'json',
            options: ['json', 'csv', 'table']
          },
          {
            id: 'ui-6',
            type: 'button',
            label: 'Process Data',
            handler: 'execute'
          }
        ]
      },
      {
        id: 'ui-7',
        type: 'container',
        label: 'Visualization',
        children: [
          {
            id: 'ui-8',
            type: 'chart',
            label: 'Data Preview',
            target: 'param-1'
          }
        ]
      }
    ];
  }
  
  return [];
};
