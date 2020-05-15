import { Controller } from "stimulus";

declare module "stimulus-validation"

declare class Attribute {
    public attr: Attribute;
    public el: HTMLElement;
}
declare class Errors {
    public has(attr: Attribute): boolean;
    public get(attr: Attribute): string;
}
declare class ValidationController extends Controller {
    static rules: any; // overwirde in subclass
    static validators: [];
    public errors: Errors;
    public validate(event: Event): void;
    public afterValidate(attribute: Attribute): void;
    public afterValidateAll(event: Event): void;
    public runValidator(attribute: Attribute): void;
    public validateAll(event: Event): void
}