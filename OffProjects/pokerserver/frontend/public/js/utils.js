const newTemplate = async (file, props = {}) => {
    return fetch(file)
        .then((res) => res.text())
        .then((string) =>
            string.replaceAll(/{{(.+?)}}/gms, (_, exp) => eval(exp))
        );
};

const addTemplate = (component, file, props) => {
    newTemplate(file, props).then(
        (templateString) => (component.innerHTML += templateString)
    );
};
