type Tpl = {
  ROSTemplateFormatVersion?: string;
  Transform?: string;
  Resources?: TplResource;
}

type TplResource = {
  [key: string]: TplResourceElement;
}

interface TplResourceElementSupplement {
  [key: string]: TplResourceElementElement;
}

type TplResourceElement = TplResourceElementSupplement & {
  Type: string;
}

type TplResourceElementElement = {
  Type: string;
  Properties: {
    Handler: string;
    Runtime: string;
    Timeout: number;
    MemorySize: number;
    CodeUri: string;
  };
}
