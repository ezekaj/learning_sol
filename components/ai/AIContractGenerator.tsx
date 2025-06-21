import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, Code, Download, Copy, Play, Settings,
  Zap, Shield, Coins, Users, FileText, Layers
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import CustomToast from '../ui/CustomToast';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'token' | 'defi' | 'nft' | 'dao' | 'utility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  icon: React.ComponentType<any>;
}

interface GeneratedContract {
  code: string;
  explanation: string;
  gasEstimate: number;
  securityNotes: string[];
  testCases: string[];
}

interface AIContractGeneratorProps {
  onCodeGenerated?: (code: string) => void;
  className?: string;
}

const contractTemplates: ContractTemplate[] = [
  {
    id: 'erc20-token',
    name: 'ERC-20 Token',
    description: 'Standard fungible token with transfer, approval, and minting capabilities',
    category: 'token',
    difficulty: 'beginner',
    features: ['Transfer', 'Approval', 'Minting', 'Burning'],
    icon: Coins
  },
  {
    id: 'erc721-nft',
    name: 'ERC-721 NFT',
    description: 'Non-fungible token with metadata and enumerable features',
    category: 'nft',
    difficulty: 'intermediate',
    features: ['Minting', 'Metadata', 'Enumerable', 'Royalties'],
    icon: FileText
  },
  {
    id: 'multisig-wallet',
    name: 'Multi-Signature Wallet',
    description: 'Secure wallet requiring multiple signatures for transactions',
    category: 'utility',
    difficulty: 'advanced',
    features: ['Multi-sig', 'Proposal System', 'Time Locks', 'Emergency Stop'],
    icon: Shield
  },
  {
    id: 'staking-pool',
    name: 'Staking Pool',
    description: 'DeFi staking contract with rewards distribution',
    category: 'defi',
    difficulty: 'intermediate',
    features: ['Staking', 'Rewards', 'Compound Interest', 'Withdrawal'],
    icon: Zap
  },
  {
    id: 'dao-governance',
    name: 'DAO Governance',
    description: 'Decentralized governance with voting and proposal mechanisms',
    category: 'dao',
    difficulty: 'advanced',
    features: ['Voting', 'Proposals', 'Delegation', 'Execution'],
    icon: Users
  },
  {
    id: 'simple-storage',
    name: 'Simple Storage',
    description: 'Basic contract for storing and retrieving data',
    category: 'utility',
    difficulty: 'beginner',
    features: ['Store Data', 'Retrieve Data', 'Access Control'],
    icon: Layers
  }
];

export const AIContractGenerator: React.FC<AIContractGeneratorProps> = ({
  onCodeGenerated,
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [customRequirements, setCustomRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

  // Advanced options
  const [solidityVersion, setSolidityVersion] = useState('0.8.19');
  const [includeComments, setIncludeComments] = useState(true);
  const [optimizeGas, setOptimizeGas] = useState(true);
  const [includeTests, setIncludeTests] = useState(false);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const generateContract = async () => {
    if (!selectedTemplate) {
      showToastMessage('Please select a contract template', 'warning');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI contract generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockContract: GeneratedContract = {
        code: generateMockContract(selectedTemplate, customRequirements),
        explanation: generateExplanation(selectedTemplate),
        gasEstimate: Math.floor(Math.random() * 500000) + 100000,
        securityNotes: generateSecurityNotes(selectedTemplate),
        testCases: generateTestCases(selectedTemplate)
      };

      setGeneratedContract(mockContract);
      onCodeGenerated?.(mockContract.code);
      showToastMessage('Contract generated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to generate contract', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContract = (template: ContractTemplate, requirements: string): string => {
    const baseContract = `// SPDX-License-Identifier: MIT
pragma solidity ^${solidityVersion};

${includeComments ? `/**
 * @title ${template.name}
 * @dev ${template.description}
 * Generated by AI Contract Generator
 */` : ''}

contract ${template.name.replace(/[^a-zA-Z0-9]/g, '')} {
    ${template.features.map(feature => `    // ${feature} functionality`).join('\n')}
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    ${generateContractFunctions(template)}
}`;

    return baseContract;
  };

  const generateContractFunctions = (template: ContractTemplate): string => {
    switch (template.id) {
      case 'erc20-token':
        return `
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
    }`;
      
      case 'simple-storage':
        return `
    uint256 private storedData;
    
    event DataStored(uint256 indexed value, address indexed setter);
    
    function set(uint256 value) public onlyOwner {
        storedData = value;
        emit DataStored(value, msg.sender);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }`;
      
      default:
        return `
    // Contract functionality will be implemented here
    function placeholder() public pure returns (string memory) {
        return "Contract functionality coming soon";
    }`;
    }
  };

  const generateExplanation = (template: ContractTemplate): string => {
    return `This ${template.name} contract implements ${template.description.toLowerCase()}. 
    
Key features include:
${template.features.map(feature => `• ${feature}`).join('\n')}

The contract follows best practices for security and gas optimization. All functions include proper access controls and input validation.`;
  };

  const generateSecurityNotes = (template: ContractTemplate): string[] => {
    return [
      'All external functions include proper access controls',
      'Input validation is implemented for all parameters',
      'Reentrancy protection is in place where needed',
      'Integer overflow protection using Solidity 0.8+',
      'Events are emitted for important state changes'
    ];
  };

  const generateTestCases = (template: ContractTemplate): string[] => {
    return [
      'Test contract deployment and initialization',
      'Test access control mechanisms',
      'Test main functionality with valid inputs',
      'Test edge cases and error conditions',
      'Test gas usage and optimization'
    ];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToastMessage('Code copied to clipboard!', 'success');
  };

  const downloadContract = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name.replace(/[^a-zA-Z0-9]/g, '')}.sol`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMessage('Contract downloaded!', 'success');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      token: 'bg-blue-500/20 text-blue-300',
      defi: 'bg-green-500/20 text-green-300',
      nft: 'bg-purple-500/20 text-purple-300',
      dao: 'bg-orange-500/20 text-orange-300',
      utility: 'bg-gray-500/20 text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors.utility;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-green-400',
      intermediate: 'text-yellow-400',
      advanced: 'text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">AI Contract Generator</h2>
              <p className="text-gray-400">Generate smart contracts with AI assistance</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            variant="outline"
            className="border-white/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced
          </Button>
        </div>
      </Card>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="font-semibold text-white mb-4">Advanced Options</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Solidity Version</label>
                  <select
                    value={solidityVersion}
                    onChange={(e) => setSolidityVersion(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    <option value="0.8.19">0.8.19</option>
                    <option value="0.8.18">0.8.18</option>
                    <option value="0.8.17">0.8.17</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="comments"
                    checked={includeComments}
                    onChange={(e) => setIncludeComments(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="comments" className="text-sm text-gray-300">Include Comments</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="optimize"
                    checked={optimizeGas}
                    onChange={(e) => setOptimizeGas(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="optimize" className="text-sm text-gray-300">Optimize Gas</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tests"
                    checked={includeTests}
                    onChange={(e) => setIncludeTests(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="tests" className="text-sm text-gray-300">Include Tests</label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selection */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Choose a Contract Template</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <template.icon className="w-6 h-6 text-purple-400" />
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                  <span className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
              </div>
              
              <h4 className="font-semibold text-white mb-2">{template.name}</h4>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                    +{template.features.length - 3}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Custom Requirements */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Custom Requirements (Optional)</h3>
        
        <textarea
          value={customRequirements}
          onChange={(e) => setCustomRequirements(e.target.value)}
          placeholder="Describe any specific features or modifications you need..."
          className="w-full h-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        <div className="flex justify-end mt-4">
          <Button
            onClick={generateContract}
            disabled={!selectedTemplate || isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Contract
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Contract */}
      <AnimatePresence>
        {generatedContract && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Contract</h3>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => copyToClipboard(generatedContract.code)}
                    variant="outline"
                    size="sm"
                    className="border-white/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  
                  <Button
                    onClick={downloadContract}
                    variant="outline"
                    size="sm"
                    className="border-white/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Contract Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-semibold text-green-400">
                    ~{generatedContract.gasEstimate.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Estimated Gas</div>
                </div>
                
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-semibold text-blue-400">
                    {generatedContract.securityNotes.length}
                  </div>
                  <div className="text-xs text-gray-400">Security Features</div>
                </div>
                
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-lg font-semibold text-purple-400">
                    {generatedContract.testCases.length}
                  </div>
                  <div className="text-xs text-gray-400">Test Cases</div>
                </div>
              </div>

              {/* Code Display */}
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{generatedContract.code}</code>
                </pre>
              </div>

              {/* Explanation */}
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Explanation</h4>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  {generatedContract.explanation}
                </p>
              </div>

              {/* Security Notes */}
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Security Features</h4>
                <ul className="space-y-1">
                  {generatedContract.securityNotes.map((note, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                      <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Test Cases */}
              <div>
                <h4 className="font-semibold text-white mb-2">Recommended Tests</h4>
                <ul className="space-y-1">
                  {generatedContract.testCases.map((test, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                      <Play className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <CustomToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIContractGenerator;
