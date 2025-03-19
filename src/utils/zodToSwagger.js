const { z } = require('zod');

function zodToSwagger(zodSchema) {
  console.log('Input schema:', zodSchema);
  
  if (zodSchema instanceof z.ZodObject) {
    const properties = {};
    const required = [];

    console.log('Schema is a ZodObject, shape:', zodSchema.shape);

    Object.entries(zodSchema.shape).forEach(([key, value]) => {
      console.log(`Processing field: ${key}`, value);
      const { type, isRequired } = processZodSchema(value);
      console.log(`Processed field ${key}:`, { type, isRequired });
      properties[key] = type;
      if (isRequired) required.push(key);
    });

    console.log('Final properties:', properties);
    return properties;
  }

  const result = processZodSchema(zodSchema).type;
  console.log('Non-object schema result:', result);
  return result;
}

function processZodSchema(schema) {
  let type = {};
  let isRequired = !schema.isOptional();

  if (schema instanceof z.ZodString) {
    type = { type: 'string' };
    if (schema._def.checks) {
      schema._def.checks.forEach((check) => {
        if (check.kind === 'email') type.format = 'email';
      });
    }
  } 
  else if (schema instanceof z.ZodNumber) {
    type = { 
      type: 'number',
      ...(schema._def.checks?.some(c => c.kind === 'int') && { type: 'integer' })
    };
    schema._def.checks?.forEach(check => {
      if (check.kind === 'min') type.minimum = check.value;
      if (check.kind === 'max') type.maximum = check.value;
    });
  }
  else if (schema instanceof z.ZodBoolean) {
    type = { type: 'boolean' };
    if (schema._def.defaultValue?.()) {
      type.default = schema._def.defaultValue();
    }
  }
  else if (schema instanceof z.ZodEnum) {
    type = {
      type: 'string',
      enum: schema._def.values
    };
  }
  else if (schema instanceof z.ZodArray) {
    type = {
      type: 'array',
      items: processZodSchema(schema._def.type).type
    };
  }
  else if (schema instanceof z.ZodObject) {
    type = zodToSwagger(schema);
  }
  else if (schema instanceof z.ZodOptional) {
    const processed = processZodSchema(schema._def.innerType);
    type = processed.type;
    isRequired = false;
  }
  else if (schema instanceof z.ZodDate) {
    type = {
      type: 'string',
      format: 'date-time'
    };
  }

  return { type, isRequired };
}

module.exports = {
  zodToSwagger
}; 