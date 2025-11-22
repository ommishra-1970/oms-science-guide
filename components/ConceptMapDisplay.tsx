import React from 'react';
import { ConceptMapNode } from '../types';

const Node: React.FC<{ node: ConceptMapNode }> = ({ node }) => (
    <li>
        <span>{node.concept}</span>
        {node.children && node.children.length > 0 && (
            <ul>
                {node.children.map((child, index) => <Node key={index} node={child} />)}
            </ul>
        )}
    </li>
);

const ConceptMapDisplay: React.FC<{ map: ConceptMapNode }> = ({ map }) => {
    if (!map) {
        return null;
    }
    
    return (
        <div className="concept-map">
            <ul>
                <Node node={map} />
            </ul>
        </div>
    );
};

export default ConceptMapDisplay;