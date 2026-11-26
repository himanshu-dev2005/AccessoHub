const fs = require('fs');
const path = require('path');
const { basename, extname } = path;

const modelsDir = path.resolve(__dirname, '..');
const appModelsDir = path.join(modelsDir, 'appModels');
const coreModelsDir = path.join(modelsDir, 'coreModels');

const listJsFiles = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.js'))
        .map((f) => path.join(dir, f))
    : [];

const appModelsFiles = listJsFiles(appModelsDir);
const allModelFiles = [...listJsFiles(coreModelsDir), ...appModelsFiles];

const modelsFiles = allModelFiles.map((filePath) => {
  const fileNameWithExtension = basename(filePath);
  return fileNameWithExtension.replace(extname(fileNameWithExtension), '');
});

const constrollersList = [];
const appModelsList = [];
const entityList = [];
const routesList = [];

for (const filePath of appModelsFiles) {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toUpperCase());
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  );
  const entity = fileNameWithoutExtension.toLowerCase();

  const controllerName = fileNameLowerCaseFirstChar + 'Controller';
  constrollersList.push(controllerName);
  appModelsList.push(modelName);
  entityList.push(entity);

  const route = {
    entity: entity,
    modelName: modelName,
    controllerName: controllerName,
  };

  routesList.push(route);
}

module.exports = { constrollersList, appModelsList, modelsFiles, entityList, routesList };
