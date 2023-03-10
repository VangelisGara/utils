
###  TODO: Transform it to a more general example

```js
export function useMapSearchState(language, title, description, initialValues, butterfly, limit) {
    console.log('useMapSearchState', initialValues);
    const mapSearch = new MapSearch(title, description, language, butterfly, limit);
    mapSearch.defineParams(initialValues);
    const paramDefinitions = Object.values(mapSearch.paramDefinitionsById);
    const bootstrapState = { pins: [] };
    paramDefinitions.forEach(param => {
        bootstrapState[param.id] = { value: param.defaultValue, allowedValues: null };
    });
    const cache = useRef({});
    const [state, setState] = useState(bootstrapState);
    const [initialState, setInitialState] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const paramsState = {
        config: mapSearch,
        isLoading: () => isLoading,
        getPins: () => state.pins,
        updatePins: (pins) => {
            console.log('Updating pins to', pins);
            setState(oldState => Object.assign({}, oldState, { pins: pins }));
            setIsLoading(false);
        },
        getAllowedValues: (id) => state[id]?.allowedValues,
        updateAllowedValues: (id, newValues) => {
            console.log('Updating allowed values of', id, 'to', newValues);
            setState(oldState => {
                const newParamState = { value: oldState[id]?.value, allowedValues: newValues };
                console.log({ newParamState });
                const newState = Object.assign({}, oldState, { [id]: newParamState });
                console.log({ newState });
                return newState;
            });
        },
        getValue: (id) => state[id]?.value,
        updateValue: (id, newVal) => {
            setState(oldState => {
                console.log('Update value of', id, 'to', newVal);
                const paramDefinition = mapSearch.getParamDefinition(id);
                const deltaState = {
                    [id]: { value: newVal, allowedValues: oldState[id]?.allowedValues }
                };
                paramDefinitions
                    .filter(param => param.dependencies().indexOf(paramDefinition) > -1)
                    .map(param => {
                        deltaState[param.id] = { vaue: oldState[id]?.value, allowedValues: null };
                    })
                console.log({ deltaState });
                const newState = Object.assign({}, oldState, deltaState);
                console.log({ newState });
                return newState;
            });
        },
        reset: () => {
            setState(JSON.parse(initialState));
        },
        setSelectedDimos: (storeNameBasedIdentifier) => {
            console.log('setSelectedDimos', storeNameBasedIdentifier);
            const { storeName, id } = parseStoreNameBasedIdentifier(storeNameBasedIdentifier);
            const dimosObject = paramsState.getAllowedValues(DIMOS_PARAM_ID).find(dimosObject => dimosObject.id === id && dimosObject.storeName === storeName);
            paramsState.updateValue(DIMOS_PARAM_ID, dimosObject);
        }
    }

    useEffect(() => {
        console.log("[EFFECT] Initialize")
        allPromises([mapSearch.search(paramsState, cache.current), ...allowedValuesPromises(paramDefinitions, paramsState)]).then(() => {
            setInitialState(JSON.stringify(state));
        });
    }, []);

    useEffect(() => {
        console.log("[EFFECT] Dimos param value has changed");
        setIsLoading(true);
        if (initialState === JSON.stringify(state)) {
            console.log('Initial state', initialState);
            allPromises([mapSearch.search(paramsState, cache.current)]);
        }
        else {
            allPromises([mapSearch.search(paramsState, cache.current), ...allowedValuesPromises(paramDefinitions, paramsState)]);
        }
    }, [state[DIMOS_PARAM_ID].value]);

    useEffect(() => {
        console.log("[EFFECT] A param value (other than dimos) has changed");
        setIsLoading(true);
        allPromises([mapSearch.search(paramsState, cache.current)]);
    }, paramDefinitions.filter(param => param.id !== DIMOS_PARAM_ID).map(param => state[param.id].value));


    return paramsState;
}
```
